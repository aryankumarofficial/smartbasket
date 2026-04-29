import { db } from "../client.js"
import { categoryInsights } from "../schema/category-insights.js"
import { desc } from "drizzle-orm"

export async function listTrendingCategories(limit = 10) {
  const safeLimit = Math.max(1, Math.min(50, Number(limit)))
  return db
    .select()
    .from(categoryInsights)
    .orderBy(desc(categoryInsights.productCount))
    .limit(safeLimit)
}

export async function upsertCategoryInsight(params: {
  category: string
  productCount: number
  computedAt?: Date
}) {
  const [row] = await db
    .insert(categoryInsights)
    .values({
      category: params.category,
      productCount: params.productCount,
      computedAt: params.computedAt ?? new Date(),
    })
    .onConflictDoUpdate({
      target: [categoryInsights.category],
      set: {
        productCount: params.productCount,
        computedAt: params.computedAt ?? new Date(),
        updatedAt: new Date(),
      },
    })
    .returning()

  return row
}

