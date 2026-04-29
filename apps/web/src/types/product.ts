/** Matches typical GET /api/products list payloads; tighten when shared types exist. */
export interface ProductListItem {
  id: string
  name: string
  description?: string | null
  price: number
  category?: string | null
  imageUrl?: string | null
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
