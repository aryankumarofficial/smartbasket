import type { NormalizedTrackingEvent } from "../types/events"

export interface EventDispatchSummary {
  profileRefreshUserIds: string[]
  embeddingRefreshProductIds: string[]
  recommendationInvalidationUserIds: string[]
}

export async function dispatchDerivedJobs(
  events: NormalizedTrackingEvent[]
): Promise<EventDispatchSummary> {
  const profileRefreshUserIds = new Set<string>()
  const embeddingRefreshProductIds = new Set<string>()
  const recommendationInvalidationUserIds = new Set<string>()

  for (const event of events) {
    if (event.userId) {
      profileRefreshUserIds.add(event.userId)
    }

    if (event.productId && event.eventType !== "search") {
      embeddingRefreshProductIds.add(event.productId)
    }

    if (
      event.userId &&
      ["cart_add", "cart_remove", "purchase", "wishlist_add"].includes(
        event.eventType
      )
    ) {
      recommendationInvalidationUserIds.add(event.userId)
    }
  }

  return {
    profileRefreshUserIds: [...profileRefreshUserIds],
    embeddingRefreshProductIds: [...embeddingRefreshProductIds],
    recommendationInvalidationUserIds: [
      ...recommendationInvalidationUserIds,
    ],
  }
}
