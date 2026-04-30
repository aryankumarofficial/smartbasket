import { and, count, countDistinct, eq, gte, isNotNull, lte, ne, sql } from "drizzle-orm"

import { db } from "../client"
import { orders } from "../schema/orders"
import { userSessions } from "../schema/user-sessions"
import { users } from "../schema/users"

import {
  countOrders,
  sumOrderRevenueExcludingCancelled,
  topProductsByUnits,
} from "./order-admin"

export async function countUsers() {
  const [row] = await db.select({ c: count() }).from(users)
  return Number(row?.c ?? 0)
}

export async function countDistinctBuyers() {
  const [row] = await db
    .select({ c: countDistinct(orders.userId) })
    .from(orders)
    .where(ne(orders.status, "cancelled"))
  return Number(row?.c ?? 0)
}

export async function countActiveUsersSince(since: Date) {
  const [row] = await db
    .select({ c: countDistinct(userSessions.userId) })
    .from(userSessions)
    .where(and(isNotNull(userSessions.userId), gte(userSessions.lastActivityAt, since)))
  return Number(row?.c ?? 0)
}

export async function getOrdersDailySeries(from: Date, to: Date) {
  const day = sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`.as("day")
  const rows = await db
    .select({
      day,
      orderCount: count(orders.id),
      revenue: sql<string>`coalesce(sum(${orders.totalAmount}::numeric), 0)::text`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, from),
        lte(orders.createdAt, to),
        ne(orders.status, "cancelled")
      )
    )
    .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
    .orderBy(sql`date_trunc('day', ${orders.createdAt})`)

  return rows.map((r) => ({
    day: r.day,
    orderCount: Number(r.orderCount ?? 0),
    revenue: Number.parseFloat(String(r.revenue ?? "0")) || 0,
  }))
}

export async function getAdminDashboardSnapshot(opts?: { from?: Date; to?: Date }) {
  const to = opts?.to ?? new Date()
  const from = opts?.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)

  const since7d = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalOrders,
    revenueRaw,
    topProducts,
    buyers,
    activeUsers7d,
    series,
  ] = await Promise.all([
    countUsers(),
    countOrders(),
    sumOrderRevenueExcludingCancelled(),
    topProductsByUnits(5),
    countDistinctBuyers(),
    countActiveUsersSince(since7d),
    getOrdersDailySeries(from, to),
  ])

  const revenue = Number.parseFloat(String(revenueRaw ?? "0")) || 0
  const conversionRate =
    totalUsers > 0 ? Math.min(1, Math.max(0, buyers / totalUsers)) : 0

  return {
    totalUsers,
    totalOrders,
    revenue,
    currency: "INR",
    conversionRate,
    activeUsers7d,
    seriesFrom: from.toISOString(),
    seriesTo: to.toISOString(),
    ordersSeries: series,
    topProducts: topProducts.map((r) => ({
      productId: r.productId,
      name: r.productName,
      unitsSold: Number(r.units ?? 0),
    })),
  }
}
