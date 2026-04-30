import { apiFetch } from "@/src/lib/api"
import type {
  RecommendationStrategy,
  RecommendedProduct,
} from "@/lib/types/recommendations"
import type { ProductListItem } from "@/src/types/product"
import { getProductById } from "@/src/services/product.service"

export type RecommendationsApiResponse = {
  recommendations: RecommendedProduct[]
}

export async function fetchRecommendations(params: {
  userId: string
  limit?: number
  occasion?: string
  recipientType?: string
  category?: string
}): Promise<RecommendationsApiResponse> {
  const q = new URLSearchParams({ userId: params.userId })
  if (params.limit != null) {
    q.set("limit", String(params.limit))
  }
  if (params.occasion) {
    q.set("occasion", params.occasion)
  }
  if (params.recipientType) {
    q.set("recipientType", params.recipientType)
  }
  if (params.category) {
    q.set("category", params.category)
  }
  return apiFetch<RecommendationsApiResponse>(`/api/recommendations?${q}`)
}

/** ML similar products (`/api/recommendations/similar/:productId`). */
export async function fetchSimilarProducts(
  productId: string,
  limit = 12
): Promise<RecommendationsApiResponse> {
  const q = new URLSearchParams({ limit: String(limit) })
  return apiFetch<RecommendationsApiResponse>(
    `/api/recommendations/similar/${encodeURIComponent(productId)}?${q}`
  )
}

/** Search + optional semantic rerank via backend (`GET /api/search`). */
export type StorefrontSearchResponse = {
  products: ProductListItem[]
  total: number
  filters: Record<string, unknown>
}

export async function semanticSearch(params: {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  occasion?: string
  recipientType?: string
  limit?: number
  offset?: number
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest" | "relevance"
  userId?: string
  sessionId?: string
}): Promise<StorefrontSearchResponse> {
  const q = new URLSearchParams()
  if (params.q) {
    q.set("q", params.q)
  }
  if (params.category) {
    q.set("category", params.category)
  }
  if (params.minPrice != null) {
    q.set("minPrice", String(params.minPrice))
  }
  if (params.maxPrice != null) {
    q.set("maxPrice", String(params.maxPrice))
  }
  if (params.occasion) {
    q.set("occasion", params.occasion)
  }
  if (params.recipientType) {
    q.set("recipientType", params.recipientType)
  }
  if (params.limit != null) {
    q.set("limit", String(params.limit))
  }
  if (params.offset != null) {
    q.set("offset", String(params.offset))
  }
  if (params.sortBy) {
    q.set("sortBy", params.sortBy)
  }
  if (params.userId) {
    q.set("userId", params.userId)
  }
  if (params.sessionId) {
    q.set("sessionId", params.sessionId)
  }
  const qs = q.toString()
  return apiFetch<StorefrontSearchResponse>(`/api/search${qs ? `?${qs}` : ""}`)
}

export type EnrichedRecommendation = RecommendedProduct & {
  product?: ProductListItem | null
  strategy?: RecommendationStrategy
}

export async function hydrateRecommendationsWithProducts(
  recommendations: RecommendedProduct[],
  concurrency = 6
): Promise<EnrichedRecommendation[]> {
  const out: EnrichedRecommendation[] = []
  for (let i = 0; i < recommendations.length; i += concurrency) {
    const slice = recommendations.slice(i, i + concurrency)
    const settled = await Promise.allSettled(
      slice.map(async (r) => {
        try {
          const { product } = await getProductById(r.productId)
          return { ...r, product, strategy: r.strategy }
        } catch {
          return { ...r, product: null, strategy: r.strategy }
        }
      })
    )
    for (const s of settled) {
      if (s.status === "fulfilled") {
        out.push(s.value)
      }
    }
  }
  return out
}
