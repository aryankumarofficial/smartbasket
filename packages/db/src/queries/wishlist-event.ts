import { and, desc, eq, gte, sql } from "drizzle-orm"
import { db } from "../client"
import { wishlistEvents } from "../schema/wishlist-events"

export const createWishlistEvent = async (data: {
  userId: string
  sessionId?: string
  productId: string
  action: string
  metadata?: Record<string, unknown>
}) => {
  await db.insert(wishlistEvents).values(data)
}

export const getWishlistEventsByUser = async (
  userId: string,
  limit = 50
) => {
  return db.query.wishlistEvents.findMany({
    where: eq(wishlistEvents.userId, userId),
    orderBy: [desc(wishlistEvents.createdAt)],
    limit,
  })
}

export const getMostWishlistedProducts = async (
  limit = 20,
  since?: Date
) => {
  const conditions = [eq(wishlistEvents.action, "add")]
  if (since) {
    conditions.push(gte(wishlistEvents.createdAt, since))
  }

  return db
    .select({
      productId: wishlistEvents.productId,
      wishlistCount: sql<number>`count(*)`.as("wishlist_count"),
    })
    .from(wishlistEvents)
    .where(and(...conditions))
    .groupBy(wishlistEvents.productId)
    .orderBy(sql`count(*) desc`)
    .limit(limit)
}
