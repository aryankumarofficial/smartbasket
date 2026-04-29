import { cleanupOldSessions } from "@workspace/db/queries/session"
import { cleanupExpiredCache } from "@workspace/db/queries/recommendation"

export async function cleanupSessions(): Promise<{ deleted: number }> {
  console.log("[Worker] Starting session cleanup...")

  // Clean sessions older than 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  try {
    await cleanupOldSessions(thirtyDaysAgo)
    console.log("[Worker] Old sessions cleaned up")
  } catch (error) {
    console.error("[Worker] Session cleanup failed:", error)
  }

  return { deleted: 0 }
}

export async function cleanupCache(): Promise<void> {
  console.log("[Worker] Starting cache cleanup...")

  try {
    await cleanupExpiredCache()
    console.log("[Worker] Expired cache entries cleaned up")
  } catch (error) {
    console.error("[Worker] Cache cleanup failed:", error)
  }
}
