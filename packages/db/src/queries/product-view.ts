import { and, desc, eq, gte, sql } from "drizzle-orm"
import { db } from "../client.js"
import { productViews } from "../schema/product-views.js"

export const createProductView = async (data: {
  userId?: string
  sessionId?: string
  productId: string
  duration?: number
  source?: string
  metadata?: Record<string, unknown>
}) => {
  await db.insert(productViews).values(data)
}

export const getProductViewsByUser = async (
  userId: string,
  limit = 50
) => {
  return db.query.productViews.findMany({
    where: eq(productViews.userId, userId),
    orderBy: [desc(productViews.createdAt)],
    limit,
  })
}

export const getProductViewsByProduct = async (
  productId: string,
  limit = 100
) => {
  return db.query.productViews.findMany({
    where: eq(productViews.productId, productId),
    orderBy: [desc(productViews.createdAt)],
    limit,
  })
}

export const getProductViewCount = async (
  productId: string,
  since?: Date
) => {
  const conditions = [eq(productViews.productId, productId)]
  if (since) {
    conditions.push(gte(productViews.createdAt, since))
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(productViews)
    .where(and(...conditions))

  return result[0]?.count ?? 0
}

export const getMostViewedProducts = async (
  limit = 20,
  since?: Date
) => {
  const conditions = since
    ? [gte(productViews.createdAt, since)]
    : []

  return db
    .select({
      productId: productViews.productId,
      viewCount: sql<number>`count(*)`.as("view_count"),
    })
    .from(productViews)
    .where(and(...conditions))
    .groupBy(productViews.productId)
    .orderBy(sql`count(*) desc`)
    .limit(limit)
}
