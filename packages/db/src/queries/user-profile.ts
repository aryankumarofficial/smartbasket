import { eq } from "drizzle-orm"
import { db } from "../client"
import { userProfiles } from "../schema/user-profiles"

export const getUserProfile = async (userId: string) => {
  return db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  })
}

export const upsertUserProfile = async (
  userId: string,
  data: Partial<{
    categoryAffinities: Record<string, number>
    avgOrderValue: number
    preferredPriceRange: { min: number; max: number }
    totalViews: number
    totalPurchases: number
    totalSearches: number
    totalCartAdds: number
    totalWishlistAdds: number
    behavioralTags: string[]
    topOccasions: { occasion: string; count: number }[]
    topRecipients: { type: string; count: number }[]
    segment: string
    lastActiveAt: Date
    profileVersion: number
  }>
) => {
  const existing = await getUserProfile(userId)

  if (existing) {
    await db
      .update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, userId))
    return { ...existing, ...data }
  }

  const [profile] = await db
    .insert(userProfiles)
    .values({ userId, ...data })
    .returning()
  return profile
}
