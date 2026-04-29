import type { StructuredTag } from "@/src/modules/tagging/types"

export interface ProductUpsertInput {
  title: string
  description?: string
  price: string
  category: string
  categoryId?: string
  images?: string[]
  metadata?: Record<string, unknown>
  manualTags?: StructuredTag[]
}
