import { eq, lt } from "drizzle-orm"
import { db } from "../client"
import { userSessions } from "../schema/user-sessions"

export const createSession = async (data: {
  sessionId: string
  userId?: string
  userAgent?: string
  ipAddress?: string
  deviceType?: string
  metadata?: Record<string, unknown>
}) => {
  const [session] = await db
    .insert(userSessions)
    .values(data)
    .returning()
  return session
}

export const getSessionById = async (sessionId: string) => {
  return db.query.userSessions.findFirst({
    where: eq(userSessions.sessionId, sessionId),
  })
}

export const updateSessionActivity = async (sessionId: string) => {
  await db
    .update(userSessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(userSessions.sessionId, sessionId))
}

export const endSession = async (sessionId: string) => {
  await db
    .update(userSessions)
    .set({ endTime: new Date() })
    .where(eq(userSessions.sessionId, sessionId))
}

export const linkSessionToUser = async (
  sessionId: string,
  userId: string
) => {
  await db
    .update(userSessions)
    .set({ userId })
    .where(eq(userSessions.sessionId, sessionId))
}

export const cleanupOldSessions = async (olderThan: Date) => {
  return db
    .delete(userSessions)
    .where(lt(userSessions.lastActivityAt, olderThan))
}
