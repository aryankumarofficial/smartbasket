export interface RecommendationRequest {
  userId: string
  limit?: number
  context?: {
    occasion?: string
    recipientType?: string
    budget?: { min: number; max: number }
    category?: string
  }
}

export interface RecommendedProduct {
  productId: string
  score: number
  reason: string
  strategy: RecommendationStrategy
}

export type RecommendationStrategy =
  | "content_based"
  | "collaborative"
  | "hybrid"
  | "popular"
  | "rule_based"

export interface SimilarProductsRequest {
  productId: string
  limit?: number
}

export interface SearchRerankRequest {
  query: string
  productIds: string[]
  userId?: string
}
