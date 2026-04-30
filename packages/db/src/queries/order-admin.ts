import { and, count, desc, eq, gte, ilike, lte, ne, or, sql, sum } from "drizzle-orm"

import { db } from "../client"
import { orderItems, orders } from "../schema/orders"
import { users } from "../schema/users"

export async function countOrders() {
  const [row] = await db.select({ c: count() }).from(orders)
  return Number(row?.c ?? 0)
}

export async function listOrdersWithUsers(limit = 100) {
  return db
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userId: orders.userId,
      userEmail: users.email,
      userName: users.name,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
}

export async function listOrdersForAdmin(opts: {
  limit?: number
  status?: string
  from?: Date
  to?: Date
  q?: string
}) {
  const limit = Math.min(200, Math.max(1, opts.limit ?? 100))
  const conditions = []
  if (opts.status?.trim()) {
    conditions.push(eq(orders.status, opts.status.trim()))
  }
  if (opts.from) {
    conditions.push(gte(orders.createdAt, opts.from))
  }
  if (opts.to) {
    conditions.push(lte(orders.createdAt, opts.to))
  }
  if (opts.q?.trim()) {
    const p = `%${opts.q.trim()}%`
    conditions.push(or(ilike(users.email, p), ilike(users.name, p)))
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  return db
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userId: orders.userId,
      userEmail: users.email,
      userName: users.name,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
}

export async function getAdminOrderDetail(orderId: string) {
  const [orderRow] = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userId: orders.userId,
      userEmail: users.email,
      userName: users.name,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!orderRow) return null

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      productName: orderItems.productName,
      productImage: orderItems.productImage,
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  return { order: orderRow, items }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const [row] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning()
  return row
}

export async function sumOrderRevenueExcludingCancelled() {
  const [row] = await db
    .select({
      total: sum(orders.totalAmount),
    })
    .from(orders)
    .where(ne(orders.status, "cancelled"))
  return row?.total ?? "0"
}

export async function topProductsByUnits(limit = 5) {
  const qtySum = sum(orderItems.quantity)
  return db
    .select({
      productId: orderItems.productId,
      productName: orderItems.productName,
      units: qtySum,
    })
    .from(orderItems)
    .groupBy(orderItems.productId, orderItems.productName)
    .orderBy(desc(qtySum))
    .limit(limit)
}
