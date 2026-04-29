import type { AnalyticsSnapshot } from "./types"

export function ensureAnalyticsSnapshot(snapshot: AnalyticsSnapshot) {
  if (!snapshot.topTags || !snapshot.trendingCategories) {
    throw new Error("Invalid analytics snapshot")
  }
}
