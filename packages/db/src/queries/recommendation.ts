import { and, eq, gte, lte, desc } from "drizzle-orm"
import { db } from "../client"
import {
  recommendationCache,
  type CachedRecommendation,
} from "../schema/recommendation-cache"

export const getCachedRecommendations = async (
  userId: string,
  strategy?: string
) => {
  const conditions = [
    eq(recommendationCache.userId, userId),
    gte(recommendationCache.expiresAt, new Date()),
  ]

  if (strategy) {
    conditions.push(eq(recommendationCache.strategy, strategy))
  }

  return db.query.recommendationCache.findFirst({
    where: and(...conditions),
    orderBy: [desc(recommendationCache.createdAt)],
  })
}

export const setCachedRecommendations = async (data: {
  userId: string
  strategy: string
  recommendations: CachedRecommendation[]
  context?: Record<string, unknown>
  score?: number
  ttlMinutes?: number
}) => {
  const ttl = data.ttlMinutes ?? 30
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000)

  const [cached] = await db
    .insert(recommendationCache)
    .values({
      userId: data.userId,
      strategy: data.strategy,
      recommendations: data.recommendations,
      context: data.context,
      score: data.score,
      expiresAt,
    })
    .returning()

  return cached
}

export const invalidateUserCache = async (userId: string) => {
  await db
    .delete(recommendationCache)
    .where(eq(recommendationCache.userId, userId))
}

export const cleanupExpiredCache = async () => {
  return db
    .delete(recommendationCache)
    .where(lte(recommendationCache.expiresAt, new Date()))
}
