import { categoryInsights, db, tagInsights } from "@workspace/db"
import { desc } from "drizzle-orm"

export const analyticsRepository = {
  async getTagInsights(limit = 20) {
    return db
      .select({
        tag: tagInsights.tag,
        category: tagInsights.category,
        productCount: tagInsights.productCount,
        viewCount: tagInsights.viewCount,
        clickCount: tagInsights.clickCount,
        purchaseCount: tagInsights.purchaseCount,
        computedAt: tagInsights.computedAt,
      })
      .from(tagInsights)
      .orderBy(desc(tagInsights.purchaseCount), desc(tagInsights.clickCount))
      .limit(limit)
  },

  async getTrendingCategories(limit = 10) {
    return db
      .select({
        category: categoryInsights.category,
        productCount: categoryInsights.productCount,
        computedAt: categoryInsights.computedAt,
      })
      .from(categoryInsights)
      .orderBy(desc(categoryInsights.productCount))
      .limit(limit)
  },
}
