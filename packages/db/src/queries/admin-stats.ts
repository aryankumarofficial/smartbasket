import { count } from "drizzle-orm"

import { db } from "../client.js"
import { users } from "../schema/users.js"

import {
  countOrders,
  sumOrderRevenueExcludingCancelled,
  topProductsByUnits,
} from "./order-admin.js"

export async function countUsers() {
  const [row] = await db.select({ c: count() }).from(users)
  return Number(row?.c ?? 0)
}

export async function getAdminDashboardSnapshot() {
  const [totalUsers, totalOrders, revenueRaw, topProducts] = await Promise.all([
    countUsers(),
    countOrders(),
    sumOrderRevenueExcludingCancelled(),
    topProductsByUnits(5),
  ])

  const revenue = Number.parseFloat(String(revenueRaw ?? "0")) || 0

  return {
    totalUsers,
    totalOrders,
    revenue,
    currency: "INR",
    topProducts: topProducts.map((r) => ({
      productId: r.productId,
      name: r.productName,
      unitsSold: Number(r.units ?? 0),
    })),
  }
}
