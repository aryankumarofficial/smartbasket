import { db, products } from "@workspace/db"
import { sql } from "drizzle-orm"

export const analyticsRepository = {
  async getTagInsights(limit = 20) {
    return db.execute(sql`
      SELECT tag_item->>'tag' AS tag, COUNT(*)::int AS count
      FROM products, jsonb_array_elements(final_tags) AS tag_item
      GROUP BY tag_item->>'tag'
      ORDER BY COUNT(*) DESC
      LIMIT ${limit}
    `)
  },

  async getTrendingCategories(limit = 10) {
    return db
      .select({
        tag: products.category,
        count: sql<number>`count(*)`,
      })
      .from(products)
      .groupBy(products.category)
      .limit(limit)
  },
}
