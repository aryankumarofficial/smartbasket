import type { AdminProductDraft } from "@/src/components/features/admin/product-form-dialog"
import type { ProductListItem } from "@/src/types/product"

export function toAdminProductDraft(row: ProductListItem): AdminProductDraft {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    description: row.description,
    price: String(row.price),
    category: row.category,
    images: row.images,
    manualTags:
      row.manualTags?.map((t) => ({
        tag: t.tag,
        category: t.category,
        weight: t.weight,
        source: "manual" as const,
      })) ?? [],
  }
}
