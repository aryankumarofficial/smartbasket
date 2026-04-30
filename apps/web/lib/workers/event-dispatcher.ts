import type { NormalizedTrackingEvent } from "../types/events"
import {
  enqueueEmbeddingGeneration,
  enqueueProfileAggregation,
  enqueueRecommendationPrecompute,
  enqueueTagSignalUpdate,
} from "./queues"

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
  const tagSignalEvents: Array<{
    productId: string
    eventType: "view" | "click" | "purchase"
    delta: number
  }> = []

  for (const event of events) {
    if (event.userId) {
      profileRefreshUserIds.add(event.userId)
    }

    if (event.productId && event.eventType !== "search") {
      embeddingRefreshProductIds.add(event.productId)
    }

    // Tag learning signals:
    // - Views mildly increase relevance
    // - High-intent actions (cart/wishlist/search_click) increase more
    // - Purchases strongly increase relevance
    const productIdForTagSignal =
      event.eventType === "search_click"
        ? ((event.metadata?.selectedProductId as string | undefined) ?? undefined)
        : event.productId

    if (productIdForTagSignal) {
      const signal =
        event.eventType === "purchase"
          ? ({ eventType: "purchase" as const, delta: 5 } as const)
          : ["cart_add", "wishlist_add", "search_click", "product_click"].includes(
                event.eventType
              )
            ? ({ eventType: "click" as const, delta: 2 } as const)
            : ["product_view", "product_view_end"].includes(event.eventType)
              ? ({ eventType: "view" as const, delta: 1 } as const)
              : null

      if (signal) {
        tagSignalEvents.push({
          productId: productIdForTagSignal,
          ...signal,
        })
      }
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

  const profileIds = [...profileRefreshUserIds]
  const embeddingIds = [...embeddingRefreshProductIds]
  const invalidationIds = [...recommendationInvalidationUserIds]

  await Promise.all([
    ...profileIds.map((userId) =>
      enqueueProfileAggregation({ userId })
    ),
    ...embeddingIds.map((productId) =>
      enqueueEmbeddingGeneration({ productId })
    ),
    ...invalidationIds.map((userId) =>
      enqueueRecommendationPrecompute({ userId })
    ),
    ...tagSignalEvents.map((e) =>
      enqueueTagSignalUpdate({
        productId: e.productId,
        eventType: e.eventType,
        delta: e.delta,
      })
    ),
  ])

  return {
    profileRefreshUserIds: profileIds,
    embeddingRefreshProductIds: embeddingIds,
    recommendationInvalidationUserIds: invalidationIds,
  }
}
