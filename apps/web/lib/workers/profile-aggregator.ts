import { db, users } from "@workspace/db"
import { userProfileService } from "../services/user-profile.service"

export async function aggregateAllProfiles(): Promise<{
  processed: number
  errors: number
}> {
  console.log("[Worker] Starting profile aggregation...")

  const allUsers = await db.select({ id: users.id }).from(users)

  let processed = 0
  let errors = 0

  for (const user of allUsers) {
    try {
      await userProfileService.rebuildProfile(user.id)
      processed++

      if (processed % 100 === 0) {
        console.log(`[Worker] Processed ${processed}/${allUsers.length} profiles`)
      }
    } catch (error) {
      errors++
      console.error(
        `[Worker] Failed to aggregate profile for user ${user.id}:`,
        error
      )
    }
  }

  console.log(
    `[Worker] Profile aggregation complete. Processed: ${processed}, Errors: ${errors}`
  )

  return { processed, errors }
}
