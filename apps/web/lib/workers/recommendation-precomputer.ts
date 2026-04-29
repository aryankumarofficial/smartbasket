import { db, users } from "@workspace/db"
import { recommendationService } from "../services/recommendation.service"
import { getUserProfile } from "@workspace/db/queries/index"

export async function precomputeRecommendations(): Promise<{
  processed: number
  errors: number
}> {
  console.log("[Worker] Starting recommendation precomputation...")

  const allUsers = await db.select({ id: users.id }).from(users)

  let processed = 0
  let errors = 0

  for (const user of allUsers) {
    try {
      const profile = await getUserProfile(user.id)

      // Only precompute for users with enough activity
      if (profile && (profile.totalViews ?? 0) >= 5) {
        await recommendationService.getRecommendations(user.id, 20)
        processed++
      }

      if (processed % 50 === 0 && processed > 0) {
        console.log(`[Worker] Precomputed recommendations for ${processed} users`)
      }
    } catch (error) {
      errors++
      console.error(
        `[Worker] Failed to precompute for user ${user.id}:`,
        error
      )
    }
  }

  console.log(
    `[Worker] Recommendation precomputation complete. Processed: ${processed}, Errors: ${errors}`
  )

  return { processed, errors }
}
