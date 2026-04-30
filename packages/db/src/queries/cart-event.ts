import { and, desc, eq, gte, sql } from "drizzle-orm"
import { db } from "../client"
import { cartEvents } from "../schema/cart-events"

export const createCartEvent = async (data: {
  userId: string
  sessionId?: string
  productId: string
  action: string
  quantity?: number
  metadata?: Record<string, unknown>
}) => {
  await db.insert(cartEvents).values(data)
}

export const getCartEventsByUser = async (
  userId: string,
  limit = 50
) => {
  return db.query.cartEvents.findMany({
    where: eq(cartEvents.userId, userId),
    orderBy: [desc(cartEvents.createdAt)],
    limit,
  })
}

export const getMostCartedProducts = async (
  limit = 20,
  since?: Date
) => {
  const conditions = [eq(cartEvents.action, "add")]
  if (since) {
    conditions.push(gte(cartEvents.createdAt, since))
  }

  return db
    .select({
      productId: cartEvents.productId,
      addCount: sql<number>`count(*)`.as("add_count"),
    })
    .from(cartEvents)
    .where(and(...conditions))
    .groupBy(cartEvents.productId)
    .orderBy(sql`count(*) desc`)
    .limit(limit)
}
