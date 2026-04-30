import { desc, eq, sql } from "drizzle-orm"
import { db } from "../client"
import { searchLogs } from "../schema/search-logs"

export const createSearchLog = async (data: {
  userId?: string
  sessionId?: string
  query: string
  filters?: Record<string, unknown>
  resultCount?: number
  selectedProductId?: string
  metadata?: Record<string, unknown>
}) => {
  await db.insert(searchLogs).values(data)
}

export const getSearchLogsByUser = async (
  userId: string,
  limit = 50
) => {
  return db.query.searchLogs.findMany({
    where: eq(searchLogs.userId, userId),
    orderBy: [desc(searchLogs.createdAt)],
    limit,
  })
}

export const getPopularSearchQueries = async (limit = 20) => {
  return db
    .select({
      query: searchLogs.query,
      searchCount: sql<number>`count(*)`.as("search_count"),
    })
    .from(searchLogs)
    .groupBy(searchLogs.query)
    .orderBy(sql`count(*) desc`)
    .limit(limit)
}
