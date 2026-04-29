export interface TagInsight {
  tag: string
  category: "use_case" | "audience" | "price_segment" | "type"
  productCount: number
  viewCount: number
  clickCount: number
  purchaseCount: number
  computedAt: string
}

export interface CategoryInsight {
  category: string
  productCount: number
  computedAt: string
}

export interface AnalyticsSnapshot {
  topTags: TagInsight[]
  trendingCategories: CategoryInsight[]
}
