import { db } from "../client.js"
import { productTagSignals } from "../schema/product-tag-signals.js"
import { eq, sql } from "drizzle-orm"

export type TagSignalEventType = "view" | "click" | "purchase"

export async function getProductTagSignals(productId: string) {
  return db
    .select()
    .from(productTagSignals)
    .where(eq(productTagSignals.productId, productId))
}

export async function upsertProductTagSignal(params: {
  productId: string
  tag: string
  category: "use_case" | "audience" | "price_segment" | "type"
  eventType: TagSignalEventType
  delta?: number
}) {
  const delta = Math.max(1, Number(params.delta ?? 1))

  const insert = {
    productId: params.productId,
    tag: params.tag,
    category: params.category,
    viewCount: params.eventType === "view" ? delta : 0,
    clickCount: params.eventType === "click" ? delta : 0,
    purchaseCount: params.eventType === "purchase" ? delta : 0,
  }

  const [row] = await db
    .insert(productTagSignals)
    .values(insert)
    .onConflictDoUpdate({
      target: [
        productTagSignals.productId,
        productTagSignals.category,
        productTagSignals.tag,
      ],
      set: {
        viewCount:
          params.eventType === "view"
            ? sql<number>`${productTagSignals.viewCount} + ${delta}`
            : productTagSignals.viewCount,
        clickCount:
          params.eventType === "click"
            ? sql<number>`${productTagSignals.clickCount} + ${delta}`
            : productTagSignals.clickCount,
        purchaseCount:
          params.eventType === "purchase"
            ? sql<number>`${productTagSignals.purchaseCount} + ${delta}`
            : productTagSignals.purchaseCount,
        updatedAt: new Date(),
      },
    })
    .returning()

  return row
}

