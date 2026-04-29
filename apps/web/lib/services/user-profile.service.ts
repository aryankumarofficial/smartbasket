import {
  getUserProfile,
  upsertUserProfile,
  getProductViewsByUser,
  getCartEventsByUser,
  getWishlistEventsByUser,
  getSearchLogsByUser,
  getRecentEvents,
} from "@workspace/db/queries/index"
import { getProducts } from "@workspace/db/queries/product"

export class UserProfileService {
  async getProfile(userId: string) {
    return getUserProfile(userId)
  }

  async rebuildProfile(userId: string) {
    const [views, cartEvents, wishlistEvents, searches, recentEvents] =
      await Promise.all([
        getProductViewsByUser(userId, 500),
        getCartEventsByUser(userId, 500),
        getWishlistEventsByUser(userId, 500),
        getSearchLogsByUser(userId, 200),
        getRecentEvents(userId, 500),
      ])

    // Compute category affinities from viewed/purchased products
    const categoryAffinities = await this.computeCategoryAffinities(
      userId,
      views,
      recentEvents
    )

    // Compute price range from purchases
    const priceStats = await this.computePriceStats(userId, recentEvents)

    // Derive behavioral tags
    const behavioralTags = this.deriveBehavioralTags({
      viewCount: views.length,
      cartAddCount: cartEvents.filter((e) => e.action === "add").length,
      wishlistCount: wishlistEvents.filter((e) => e.action === "add")
        .length,
      searchCount: searches.length,
      purchaseCount: recentEvents.filter(
        (e) => e.eventType === "purchase"
      ).length,
    })

    // Compute top occasions/recipients from event metadata
    const topOccasions = this.extractTopOccasions(recentEvents)
    const topRecipients = this.extractTopRecipients(recentEvents)

    // Determine user segment
    const segment = this.classifySegment({
      totalViews: views.length,
      totalPurchases: recentEvents.filter(
        (e) => e.eventType === "purchase"
      ).length,
      totalSearches: searches.length,
      daysSinceLastActive: views.length
        ? Math.floor(
            (Date.now() - new Date(views[0]!.createdAt).getTime()) /
              86400000
          )
        : 999,
    })

    return upsertUserProfile(userId, {
      categoryAffinities,
      avgOrderValue: priceStats.avgOrderValue,
      preferredPriceRange: priceStats.priceRange,
      totalViews: views.length,
      totalPurchases: recentEvents.filter(
        (e) => e.eventType === "purchase"
      ).length,
      totalSearches: searches.length,
      totalCartAdds: cartEvents.filter((e) => e.action === "add").length,
      totalWishlistAdds: wishlistEvents.filter((e) => e.action === "add")
        .length,
      behavioralTags,
      topOccasions,
      topRecipients,
      segment,
      lastActiveAt: new Date(),
      profileVersion: 1,
    })
  }

  private async computeCategoryAffinities(
    _userId: string,
    views: { productId: string }[],
    events: { eventType: string; productId: string | null }[]
  ): Promise<Record<string, number>> {
    const productIds = [
      ...new Set([
        ...views.map((v) => v.productId),
        ...events
          .filter((e) => e.productId)
          .map((e) => e.productId as string),
      ]),
    ]

    if (productIds.length === 0) return {}

    const products = await getProducts({})
    const productMap = new Map(products.map((p) => [p.id, p]))

    const categoryCounts: Record<string, number> = {}
    for (const pid of productIds) {
      const product = productMap.get(pid)
      if (product?.category) {
        categoryCounts[product.category] =
          (categoryCounts[product.category] ?? 0) + 1
      }
    }

    const total = Object.values(categoryCounts).reduce(
      (a, b) => a + b,
      0
    )
    const affinities: Record<string, number> = {}
    for (const [cat, count] of Object.entries(categoryCounts)) {
      affinities[cat] = Math.round((count / total) * 100) / 100
    }

    return affinities
  }

  private async computePriceStats(
    _userId: string,
    events: { eventType: string; metadata: Record<string, unknown> | null }[]
  ) {
    const purchases = events.filter((e) => e.eventType === "purchase")
    const amounts = purchases
      .map((e) => Number(e.metadata?.totalAmount ?? 0))
      .filter((a) => a > 0)

    if (amounts.length === 0) {
      return { avgOrderValue: 0, priceRange: { min: 0, max: 0 } }
    }

    const avg =
      amounts.reduce((a, b) => a + b, 0) / amounts.length
    const min = Math.min(...amounts)
    const max = Math.max(...amounts)

    return {
      avgOrderValue: Math.round(avg * 100) / 100,
      priceRange: { min, max },
    }
  }

  private deriveBehavioralTags(stats: {
    viewCount: number
    cartAddCount: number
    wishlistCount: number
    searchCount: number
    purchaseCount: number
  }): string[] {
    const tags: string[] = []

    if (stats.viewCount > 50) tags.push("active_browser")
    if (stats.searchCount > 20) tags.push("active_searcher")
    if (stats.purchaseCount > 5) tags.push("repeat_buyer")
    if (stats.wishlistCount > 10) tags.push("wishlist_curator")
    if (
      stats.cartAddCount > 0 &&
      stats.purchaseCount === 0
    ) {
      tags.push("cart_abandoner")
    }
    if (stats.viewCount > 100 && stats.purchaseCount > 10) {
      tags.push("power_user")
    }

    return tags
  }

  private extractTopOccasions(
    events: { metadata: Record<string, unknown> | null }[]
  ): { occasion: string; count: number }[] {
    const counts: Record<string, number> = {}
    for (const e of events) {
      const occasion = e.metadata?.occasion as string | undefined
      if (occasion) {
        counts[occasion] = (counts[occasion] ?? 0) + 1
      }
    }

    return Object.entries(counts)
      .map(([occasion, count]) => ({ occasion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private extractTopRecipients(
    events: { metadata: Record<string, unknown> | null }[]
  ): { type: string; count: number }[] {
    const counts: Record<string, number> = {}
    for (const e of events) {
      const recipient = e.metadata?.recipientType as string | undefined
      if (recipient) {
        counts[recipient] = (counts[recipient] ?? 0) + 1
      }
    }

    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private classifySegment(stats: {
    totalViews: number
    totalPurchases: number
    totalSearches: number
    daysSinceLastActive: number
  }): string {
    if (stats.daysSinceLastActive > 30) return "churning"
    if (stats.totalPurchases === 0 && stats.totalViews < 5)
      return "new"
    if (stats.totalPurchases <= 1) return "casual"
    if (stats.totalPurchases <= 5) return "engaged"
    return "power_user"
  }
}

export const userProfileService = new UserProfileService()
