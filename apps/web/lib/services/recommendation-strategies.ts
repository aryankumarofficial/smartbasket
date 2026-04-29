import type { RecommendedProduct } from "../types/recommendations"
import {
  getMostViewedProducts,
  getMostCartedProducts,
  getMostWishlistedProducts,
  getCachedRecommendations,
  setCachedRecommendations,
  getUserProfile,
  getProductViewsByUser,
  invalidateUserCache,
} from "@workspace/db/queries/index"
import { getProducts } from "@workspace/db/queries/product"
import type { RecommendationStrategy } from "../types/recommendations"

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ?? "http://localhost:8000"

export interface StrategyResult {
  recommendations: RecommendedProduct[]
  strategy: RecommendationStrategy
  cached: boolean
}

// ─── Cold Start Strategy ────────────────────────────────────────────
export async function coldStartStrategy(
  limit: number,
  context?: Record<string, unknown>
): Promise<StrategyResult> {
  const [popular, trending, wishlisted] = await Promise.all([
    getMostViewedProducts(limit, last7Days()),
    getMostCartedProducts(limit, last7Days()),
    getMostWishlistedProducts(limit, last7Days()),
  ])

  // Merge and deduplicate
  const scored = new Map<string, { score: number; source: string }>()

  for (const p of popular) {
    const existing = scored.get(p.productId) ?? { score: 0, source: "" }
    existing.score += Number(p.viewCount) * 0.3
    existing.source = "popular"
    scored.set(p.productId, existing)
  }

  for (const p of trending) {
    const existing = scored.get(p.productId) ?? { score: 0, source: "" }
    existing.score += Number(p.addCount) * 2
    existing.source = "trending"
    scored.set(p.productId, existing)
  }

  for (const p of wishlisted) {
    const existing = scored.get(p.productId) ?? { score: 0, source: "" }
    existing.score += Number(p.wishlistCount) * 1.5
    existing.source = "wishlisted"
    scored.set(p.productId, existing)
  }

  // Apply context boost
  if (context?.category) {
    const allProducts = await getProducts({
      category: context.category as string,
    })
    const catSet = new Set(allProducts.map((p) => p.id))
    for (const [pid, data] of scored) {
      if (catSet.has(pid)) {
        data.score *= 1.5
      }
    }
  }

  const sorted = [...scored.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, limit)

  return {
    recommendations: sorted.map(([productId, data]) => ({
      productId,
      score: Math.round(data.score * 100) / 100,
      reason:
        data.source === "trending"
          ? "Trending right now"
          : data.source === "wishlisted"
            ? "Most wishlisted"
            : "Popular choice",
      strategy: "popular" as RecommendationStrategy,
    })),
    strategy: "popular",
    cached: false,
  }
}

// ─── Warm User Strategy (Hybrid) ────────────────────────────────────
export async function warmUserStrategy(
  userId: string,
  limit: number,
  context?: Record<string, unknown>
): Promise<StrategyResult> {
  // 1. Try cached
  const cached = await getCachedRecommendations(userId, "hybrid")
  if (cached) {
    return {
      recommendations: cached.recommendations
        .slice(0, limit)
        .map((r) => ({
          ...r,
          strategy: "hybrid" as RecommendationStrategy,
        })),
      strategy: "hybrid",
      cached: true,
    }
  }

  // 2. Try ML service
  try {
    const res = await fetch(`${AI_SERVICE_URL}/recommend/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit, context }),
      signal: AbortSignal.timeout(5000),
    })

    if (res.ok) {
      const data = (await res.json()) as {
        recommendations: RecommendedProduct[]
        strategy: string
      }

      // Cache the result
      await setCachedRecommendations({
        userId,
        strategy: "hybrid",
        recommendations: data.recommendations.map((r) => ({
          productId: r.productId,
          score: r.score,
          reason: r.reason,
        })),
        context,
        ttlMinutes: 30,
      }).catch(() => {})

      return {
        recommendations: data.recommendations,
        strategy: "hybrid",
        cached: false,
      }
    }
  } catch {
    // ML service unavailable
  }

  // 3. Fallback: local rule-based
  return localRuleBasedStrategy(userId, limit, context)
}

// ─── Local Rule-Based Fallback ──────────────────────────────────────
async function localRuleBasedStrategy(
  userId: string,
  limit: number,
  _context?: Record<string, unknown>
): Promise<StrategyResult> {
  const [profile, views] = await Promise.all([
    getUserProfile(userId),
    getProductViewsByUser(userId, 200),
  ])

  const allProducts = await getProducts({})
  const viewedSet = new Set(views.map((v) => v.productId))

  const scored = allProducts
    .filter((p) => !viewedSet.has(p.id))
    .map((p) => {
      let score = 0

      // Category affinity
      if (profile?.categoryAffinities) {
        const affinities = profile.categoryAffinities as Record<
          string,
          number
        >
        score += (affinities[p.category] ?? 0) * 3
      }

      // Price fit
      if (profile?.preferredPriceRange) {
        const range = profile.preferredPriceRange as {
          min: number
          max: number
        }
        const price = Number(p.price)
        if (price >= range.min && price <= range.max) score += 2
      }

      // Rating
      if (p.rating) score += Number(p.rating) * 0.5

      // Recency
      const days =
        (Date.now() - new Date(p.createdAt).getTime()) / 86400000
      if (days < 7) score += 1
      else if (days < 30) score += 0.5

      return {
        productId: p.id,
        score: Math.round(score * 100) / 100,
        reason: "Recommended based on your preferences",
        strategy: "rule_based" as RecommendationStrategy,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  // Cache fallback results
  if (scored.length > 0) {
    await setCachedRecommendations({
      userId,
      strategy: "hybrid",
      recommendations: scored.map((r) => ({
        productId: r.productId,
        score: r.score,
        reason: r.reason,
      })),
      ttlMinutes: 15,
    }).catch(() => {})
  }

  return {
    recommendations: scored,
    strategy: "rule_based",
    cached: false,
  }
}

// ─── Real-Time Strategy ─────────────────────────────────────────────
export async function realTimeStrategy(
  userId: string,
  limit: number,
  context: Record<string, unknown>
): Promise<StrategyResult> {
  // Always bypass cache for real-time requests
  await invalidateUserCache(userId).catch(() => {})

  return warmUserStrategy(userId, limit, context)
}

// ─── Strategy Selector ──────────────────────────────────────────────
export async function selectStrategy(
  userId: string | null,
  limit: number,
  context?: Record<string, unknown>,
  realTime = false
): Promise<StrategyResult> {
  if (!userId) {
    return coldStartStrategy(limit, context)
  }

  const profile = await getUserProfile(userId)
  const isWarmUser = profile && (profile.totalViews ?? 0) >= 5

  if (!isWarmUser) {
    return coldStartStrategy(limit, context)
  }

  if (realTime) {
    return realTimeStrategy(userId, limit, context ?? {})
  }

  return warmUserStrategy(userId, limit, context)
}

function last7Days(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
}
