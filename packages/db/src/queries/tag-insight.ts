import { db } from "../client.js"
import { tagInsights } from "../schema/tag-insights.js"
import { desc, eq } from "drizzle-orm"

export async function listTopTags(params: {
  limit?: number
  category?: "use_case" | "audience" | "price_segment" | "type"
} = {}) {
  const limit = Math.max(1, Math.min(100, Number(params.limit ?? 20)))

  if (params.category) {
    return db
      .select()
      .from(tagInsights)
      .where(eq(tagInsights.category, params.category))
      .orderBy(desc(tagInsights.purchaseCount), desc(tagInsights.clickCount))
      .limit(limit)
  }

  return db
    .select()
    .from(tagInsights)
    .orderBy(desc(tagInsights.purchaseCount), desc(tagInsights.clickCount))
    .limit(limit)
}

export async function upsertTagInsight(params: {
  tag: string
  category: "use_case" | "audience" | "price_segment" | "type"
  productCount?: number
  viewCount?: number
  clickCount?: number
  purchaseCount?: number
  computedAt?: Date
}) {
  const [row] = await db
    .insert(tagInsights)
    .values({
      tag: params.tag,
      category: params.category,
      productCount: params.productCount ?? 0,
      viewCount: params.viewCount ?? 0,
      clickCount: params.clickCount ?? 0,
      purchaseCount: params.purchaseCount ?? 0,
      computedAt: params.computedAt ?? new Date(),
    })
    .onConflictDoUpdate({
      target: [tagInsights.category, tagInsights.tag],
      set: {
        productCount: params.productCount ?? tagInsights.productCount,
        viewCount: params.viewCount ?? tagInsights.viewCount,
        clickCount: params.clickCount ?? tagInsights.clickCount,
        purchaseCount: params.purchaseCount ?? tagInsights.purchaseCount,
        computedAt: params.computedAt ?? new Date(),
        updatedAt: new Date(),
      },
    })
    .returning()

  return row
}

export async function incrementTagInsightCounters(params: {
  tag: string
  category: "use_case" | "audience" | "price_segment" | "type"
  eventType: "view" | "click" | "purchase"
  delta?: number
}) {
  const delta = Math.max(1, Number(params.delta ?? 1))
  const [row] = await db
    .insert(tagInsights)
    .values({
      tag: params.tag,
      category: params.category,
      productCount: 0,
      viewCount: params.eventType === "view" ? delta : 0,
      clickCount: params.eventType === "click" ? delta : 0,
      purchaseCount: params.eventType === "purchase" ? delta : 0,
      computedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [tagInsights.category, tagInsights.tag],
      set: {
        viewCount:
          params.eventType === "view"
            ? tagInsights.viewCount + delta
            : tagInsights.viewCount,
        clickCount:
          params.eventType === "click"
            ? tagInsights.clickCount + delta
            : tagInsights.clickCount,
        purchaseCount:
          params.eventType === "purchase"
            ? tagInsights.purchaseCount + delta
            : tagInsights.purchaseCount,
        updatedAt: new Date(),
      },
    })
    .returning()

  return row
}

