import { analyticsRepository } from "./repository"
import type { AnalyticsSnapshot } from "./types"

export const analyticsService = {
  async getSnapshot(): Promise<AnalyticsSnapshot> {
    const [topTagsResult, trendingCategoriesResult] = await Promise.all([
      analyticsRepository.getTagInsights(),
      analyticsRepository.getTrendingCategories(),
    ])

    return {
      topTags: topTagsResult.map((r) => ({
        tag: r.tag,
        category: r.category,
        productCount: r.productCount ?? 0,
        viewCount: r.viewCount ?? 0,
        clickCount: r.clickCount ?? 0,
        purchaseCount: r.purchaseCount ?? 0,
        computedAt:
          r.computedAt instanceof Date
            ? r.computedAt.toISOString()
            : new Date(r.computedAt as any).toISOString(),
      })),
      trendingCategories: trendingCategoriesResult.map((r) => ({
        category: r.category,
        productCount: r.productCount ?? 0,
        computedAt:
          r.computedAt instanceof Date
            ? r.computedAt.toISOString()
            : new Date(r.computedAt as any).toISOString(),
      })),
    }
  },
}
