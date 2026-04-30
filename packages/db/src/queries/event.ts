import { db } from "../client"
import { userEvents } from "../schema/user-events"
import { desc, eq } from "drizzle-orm"

export const createEvent = async (data: {
  userId: string
  productId?: string
  sessionId?: string
  anonymousId?: string
  eventId?: string
  eventType: string
  source?: string
  occurredAt?: Date
  metadata?: Record<string, unknown>
}) => {
  await db.insert(userEvents).values(data)
}

export const getRecentEvents = async (userId: string, limit = 20) => {
  return db.query.userEvents.findMany({
    where: eq(userEvents.userId, userId),
    orderBy: [desc(userEvents.createdAt)],
    limit,
  })
}
