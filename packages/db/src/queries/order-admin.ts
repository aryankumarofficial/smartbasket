import { count, desc, eq, ne, sum } from "drizzle-orm"

import { db } from "../client.js"
import { orderItems, orders } from "../schema/orders.js"
import { users } from "../schema/users.js"

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
