import type {
  RecommendedProduct,
  RecommendationStrategy,
} from "../types/recommendations"
import { AI_SERVICE_URL } from "./ai-url"

export interface AiRecommendationResponse {
  recommendations: RecommendedProduct[]
  strategy?: RecommendationStrategy
}

export interface AiSearchRerankResponse {
  reranked_ids: string[]
  scores: number[]
}

export async function fetchAiRecommendations(
  userId: string,
  limit: number,
  context?: Record<string, unknown>
) {
  const response = await fetch(`${AI_SERVICE_URL}/recommend/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit, context }),
    signal: AbortSignal.timeout(5000),
  })

  if (!response.ok) {
    throw new Error(`AI recommendation request failed: ${response.status}`)
  }

  return (await response.json()) as AiRecommendationResponse
}

export async function fetchAiSimilarProducts(
  productId: string,
  limit: number
) {
  const response = await fetch(
    `${AI_SERVICE_URL}/similar-products/${productId}?limit=${limit}`,
    { signal: AbortSignal.timeout(5000) }
  )

  if (!response.ok) {
    throw new Error(`AI similar-products request failed: ${response.status}`)
  }

  return (await response.json()) as {
    recommendations: RecommendedProduct[]
  }
}

export async function fetchAiSearchRerank(
  query: string,
  productIds: string[],
  userId?: string,
  limit = 20
) {
  const response = await fetch(`${AI_SERVICE_URL}/search-rerank`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      product_ids: productIds,
      user_id: userId,
      limit,
    }),
    signal: AbortSignal.timeout(5000),
  })

  if (!response.ok) {
    throw new Error(`AI rerank request failed: ${response.status}`)
  }

  return (await response.json()) as AiSearchRerankResponse
}
