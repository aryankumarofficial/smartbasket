import { analyticsRepository } from "./repository"
import type { AnalyticsSnapshot } from "./types"

export const analyticsService = {
  async getSnapshot(): Promise<AnalyticsSnapshot> {
    const [topTagsResult, trendingCategoriesResult] = await Promise.all([
      analyticsRepository.getTagInsights(),
      analyticsRepository.getTrendingCategories(),
    ])

    return {
      topTags: topTagsResult as unknown as AnalyticsSnapshot["topTags"],
      trendingCategories:
        trendingCategoriesResult as AnalyticsSnapshot["trendingCategories"],
    }
  },
}
