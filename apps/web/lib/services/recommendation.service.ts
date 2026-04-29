import {
  getCachedRecommendations,
  setCachedRecommendations,
  getUserProfile,
  getProductViewsByUser,
  getMostViewedProducts,
  getMostCartedProducts,
  getMostWishlistedProducts,
} from "@workspace/db/queries/index"
import { getProducts } from "@workspace/db/queries/product"
import type {
  RecommendedProduct,
  RecommendationStrategy,
} from "../types/recommendations"

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ?? "http://localhost:8000"

export class RecommendationService {
  async getRecommendations(
    userId: string,
    limit = 20,
    context?: Record<string, unknown>
  ): Promise<RecommendedProduct[]> {
    // 1. Check cache first
    const cached = await getCachedRecommendations(userId, "hybrid")
    if (cached) {
      return cached.recommendations
        .slice(0, limit)
        .map((r) => ({
          ...r,
          strategy: "hybrid" as RecommendationStrategy,
        }))
    }

    // 2. Get user profile to determine strategy
    const profile = await getUserProfile(userId)

    let recommendations: RecommendedProduct[]

    if (!profile || (profile.totalViews ?? 0) < 5) {
      // Cold start: use popular + rule-based
      recommendations = await this.getColdStartRecommendations(
        limit,
        context
      )
    } else {
      // Warm user: try ML service, fallback to local hybrid
      recommendations = await this.getHybridRecommendations(
        userId,
        limit,
        context
      )
    }

    // 3. Cache results
    if (recommendations.length > 0) {
      await setCachedRecommendations({
        userId,
        strategy: "hybrid",
        recommendations: recommendations.map((r) => ({
          productId: r.productId,
          score: r.score,
          reason: r.reason,
        })),
        context,
        ttlMinutes: 30,
      }).catch(() => {
        // Cache failure is non-critical
      })
    }

    return recommendations
  }

  async getSimilarProducts(
    productId: string,
    limit = 10
  ): Promise<RecommendedProduct[]> {
    // Try ML service first
    try {
      const response = await fetch(
        `${AI_SERVICE_URL}/similar-products/${productId}?limit=${limit}`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (response.ok) {
        const data = (await response.json()) as {
          recommendations: RecommendedProduct[]
        }
        return data.recommendations
      }
    } catch {
      // ML service unavailable, fallback to category-based
    }

    return this.getCategorySimilar(productId, limit)
  }

  private async getColdStartRecommendations(
    limit: number,
    context?: Record<string, unknown>
  ): Promise<RecommendedProduct[]> {
    const [popular, trending] = await Promise.all([
      getMostViewedProducts(limit),
      getMostCartedProducts(limit),
    ])

    const productIds = [
      ...new Set([
        ...popular.map((p) => p.productId),
        ...trending.map((p) => p.productId),
      ]),
    ].slice(0, limit)

    const allProducts = await getProducts({
      category: context?.category as string | undefined,
    })
    const productMap = new Map(allProducts.map((p) => [p.id, p]))

    return productIds
      .filter((id) => productMap.has(id))
      .map((id, i) => ({
        productId: id,
        score: 1 - i * 0.05,
        reason: "Trending and popular",
        strategy: "popular" as RecommendationStrategy,
      }))
  }

  private async getHybridRecommendations(
    userId: string,
    limit: number,
    context?: Record<string, unknown>
  ): Promise<RecommendedProduct[]> {
    // Try ML service
    try {
      const response = await fetch(
        `${AI_SERVICE_URL}/recommend/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit, context }),
          signal: AbortSignal.timeout(5000),
        }
      )
      if (response.ok) {
        const data = (await response.json()) as {
          recommendations: RecommendedProduct[]
        }
        return data.recommendations
      }
    } catch {
      // ML service unavailable
    }

    // Fallback: local rule-based scoring
    return this.getLocalHybridRecommendations(userId, limit, context)
  }

  private async getLocalHybridRecommendations(
    userId: string,
    limit: number,
    _context?: Record<string, unknown>
  ): Promise<RecommendedProduct[]> {
    const [profile, views, wishlisted] = await Promise.all([
      getUserProfile(userId),
      getProductViewsByUser(userId, 100),
      getMostWishlistedProducts(limit),
    ])

    const allProducts = await getProducts({})
    const viewedSet = new Set(views.map((v) => v.productId))
    const wishlistedSet = new Set(
      wishlisted.map((w) => w.productId)
    )

    // Score each product
    const scored = allProducts
      .filter((p) => !viewedSet.has(p.id)) // exclude already viewed
      .map((p) => {
        let score = 0

        // Category affinity scoring
        if (profile?.categoryAffinities) {
          const affinity =
            (
              profile.categoryAffinities as Record<string, number>
            )[p.category] ?? 0
          score += affinity * 3
        }

        // Price fit scoring
        if (profile?.preferredPriceRange) {
          const range = profile.preferredPriceRange as {
            min: number
            max: number
          }
          const price = Number(p.price)
          if (price >= range.min && price <= range.max) {
            score += 2
          }
        }

        // Wishlist boost
        if (wishlistedSet.has(p.id)) {
          score += 1.5
        }

        // Rating boost
        if (p.rating) {
          score += Number(p.rating) * 0.5
        }

        // Recency boost
        const daysSinceCreated =
          (Date.now() - new Date(p.createdAt).getTime()) / 86400000
        if (daysSinceCreated < 7) score += 1
        else if (daysSinceCreated < 30) score += 0.5

        return {
          productId: p.id,
          score: Math.round(score * 100) / 100,
          reason: this.generateReason(p, profile),
          strategy: "rule_based" as RecommendationStrategy,
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return scored
  }

  private async getCategorySimilar(
    productId: string,
    limit: number
  ): Promise<RecommendedProduct[]> {
    const allProducts = await getProducts({})
    const target = allProducts.find((p) => p.id === productId)
    if (!target) return []

    return allProducts
      .filter(
        (p) =>
          p.id !== productId && p.category === target.category
      )
      .slice(0, limit)
      .map((p, i) => ({
        productId: p.id,
        score: 1 - i * 0.1,
        reason: `Similar to ${target.name}`,
        strategy: "content_based" as RecommendationStrategy,
      }))
  }

  private generateReason(
    product: { category: string; rating: string | null },
    profile: { categoryAffinities: unknown } | null | undefined
  ): string {
    const affinities = profile?.categoryAffinities as
      | Record<string, number>
      | undefined
    if (affinities && (affinities[product.category] ?? 0) > 0.5) {
      return `Based on your interest in ${product.category}`
    }
    if (product.rating && Number(product.rating) >= 4) {
      return "Highly rated product"
    }
    return "Recommended for you"
  }
}

export const recommendationService = new RecommendationService()
