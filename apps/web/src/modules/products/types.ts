import type { StructuredTag } from "@/src/modules/tagging/types"

export interface ProductUpsertInput {
  title: string
  description?: string
  price: string
  originalPrice?: string
  category: string
  categoryId?: string
  subcategory?: string
  brand?: string
  images?: string[]
  metadata?: Record<string, unknown>
  manualTags?: StructuredTag[]
  inventoryCount?: number
  inStock?: boolean
}
