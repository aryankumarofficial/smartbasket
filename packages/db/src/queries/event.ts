import { db } from "../client.js"
import { userEvents } from "../schema/user-events.js"
import { desc, eq } from "drizzle-orm"

export const createEvent = async (data: {
  userId: string
  productId?: string
  eventType: string
  metadata?: Record<string, any>
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
