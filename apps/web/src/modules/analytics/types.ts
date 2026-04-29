export interface TagInsight {
  tag: string
  count: number
}

export interface AnalyticsSnapshot {
  topTags: TagInsight[]
  trendingCategories: TagInsight[]
}
