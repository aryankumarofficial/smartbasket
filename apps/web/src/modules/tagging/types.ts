export type TagCategory =
  | "use_case"
  | "audience"
  | "price_segment"
  | "type"

export type TagSource = "manual" | "ai"

export interface StructuredTag {
  tag: string
  category: TagCategory
  weight: number
  source: TagSource
}

export interface TaggingPayload {
  productId: string
  title: string
  description?: string | null
  category?: string | null
  metadata?: Record<string, unknown> | null
}

export interface LlmTaggingResponse {
  tags: StructuredTag[]
}
