/** Matches GET /api/products and admin list payloads. */
export interface ProductListItem {
  id: string
  name: string
  title?: string | null
  description?: string | null
  /** Drizzle decimal serialized as string in JSON. */
  price: string | number
  category: string
  imageUrl?: string | null
  images?: string[] | null
  manualTags?: {
    tag: string
    category: "use_case" | "audience" | "price_segment" | "type"
    weight: number
    source: "manual" | "ai"
  }[] | null
}

export interface ProductListResponse {
  products: ProductListItem[]
  total: number
}

export interface ProductDetailResponse {
  product: ProductListItem
}

export interface ProductListFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
}
