import type { LlmTaggingResponse, TaggingPayload } from "@/src/modules/tagging/types"
import { AI_SERVICE_URL } from "@/lib/services/ai-url"

export const llmService = {
  async generateProductTags(payload: TaggingPayload): Promise<LlmTaggingResponse> {
    const response = await fetch(`${AI_SERVICE_URL}/tagging/product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`LLM tagging request failed: ${response.status}`)
    }

    return (await response.json()) as LlmTaggingResponse
  },

  async getRecommendations(payload: {
    userId?: string
    anonymousId?: string
    limit?: number
    context?: Record<string, unknown>
  }): Promise<{ productIds: string[] }> {
    const response = await fetch(`${AI_SERVICE_URL}/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`LLM recommendation request failed: ${response.status}`)
    }

    return (await response.json()) as { productIds: string[] }
  },

  async getSimilarProducts(payload: {
    productId: string
    limit?: number
  }): Promise<{ productIds: string[] }> {
    const response = await fetch(`${AI_SERVICE_URL}/recommendations/similar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`LLM similar-products request failed: ${response.status}`)
    }

    return (await response.json()) as { productIds: string[] }
  },
}
