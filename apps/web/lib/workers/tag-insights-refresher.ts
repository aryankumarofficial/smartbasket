import { db, products } from "@workspace/db"
import { upsertCategoryInsight } from "@workspace/db/queries/category-insight"
import { upsertTagInsight } from "@workspace/db/queries/tag-insight"
import { sql } from "drizzle-orm"

type TagCountRow = {
  tag: string
  category: "use_case" | "audience" | "price_segment" | "type"
  product_count: number
}

type CategoryCountRow = {
  category: string
  product_count: number
}

export async function refreshProductDerivedInsights() {
  const computedAt = new Date()

  // Product counts per (category, tag) derived from `products.final_tags`.
  const tagCounts = await db.execute(sql<TagCountRow>`
    SELECT
      (tag_item->>'tag')::text AS tag,
      (tag_item->>'category')::text AS category,
      COUNT(*)::int AS product_count
    FROM ${products}, jsonb_array_elements(${products.finalTags}) AS tag_item
    WHERE (tag_item ? 'tag') AND (tag_item ? 'category')
    GROUP BY (tag_item->>'tag'), (tag_item->>'category')
  `)

  // Product counts per category derived from `products.category`.
  const categoryCounts = await db.execute(sql<CategoryCountRow>`
    SELECT ${products.category}::text AS category, COUNT(*)::int AS product_count
    FROM ${products}
    GROUP BY ${products.category}
  `)

  const tagRows = Array.from(tagCounts as unknown as Iterable<TagCountRow>)
  const categoryRows = Array.from(
    categoryCounts as unknown as Iterable<CategoryCountRow>
  )

  await Promise.all([
    ...tagRows
      .filter((r: TagCountRow) => !!r.tag && !!r.category)
      .map((row: TagCountRow) =>
        upsertTagInsight({
          tag: row.tag,
          category: row.category,
          productCount: row.product_count,
          computedAt,
        })
      ),
    ...categoryRows
      .filter((r: CategoryCountRow) => !!r.category)
      .map((row: CategoryCountRow) =>
        upsertCategoryInsight({
          category: row.category,
          productCount: row.product_count,
          computedAt,
        })
      ),
  ])

  return {
    computedAt: computedAt.toISOString(),
    tags: tagRows.length,
    categories: categoryRows.length,
  }
}

