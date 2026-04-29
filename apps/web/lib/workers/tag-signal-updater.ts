import { getProductById } from "@workspace/db/queries/product"
import { incrementTagInsightCounters } from "@workspace/db/queries/tag-insight"
import { upsertProductTagSignal } from "@workspace/db/queries/product-tag-signal"
import type { ProductTag } from "@workspace/db/schema/products"

const allowedCategories = new Set([
  "use_case",
  "audience",
  "price_segment",
  "type",
])

export async function applyEventSignalToProductTags(params: {
  productId: string
  eventType: "view" | "click" | "purchase"
  delta?: number
}) {
  const product = await getProductById(params.productId)
  if (!product) {
    return { updated: 0, productId: params.productId }
  }

  const delta = Math.max(1, Number(params.delta ?? 1))
  const finalTags = (product.finalTags as ProductTag[] | null) ?? []

  let updated = 0
  await Promise.all(
    finalTags
      .filter(
        (t) =>
          !!t &&
          typeof t.tag === "string" &&
          typeof t.category === "string" &&
          allowedCategories.has(t.category)
      )
      .map(async (t) => {
        const tag = t.tag.trim().toLowerCase()
        const category = t.category as ProductTag["category"]

        await Promise.all([
          upsertProductTagSignal({
            productId: params.productId,
            tag,
            category,
            eventType: params.eventType,
            delta,
          }),
          incrementTagInsightCounters({
            tag,
            category,
            eventType: params.eventType,
            delta,
          }),
        ])
        updated += 1
      })
  )

  return { updated, productId: params.productId }
}

