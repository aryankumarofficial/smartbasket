import { and, eq, inArray, ne } from "drizzle-orm"

import { db } from "@workspace/db/client"
import {
  cartEvents,
  orderItems,
  orders,
  productViews,
  products,
  recommendationCache,
  searchLogs,
  userEvents,
  userProfiles,
  users,
  wishlistEvents,
} from "@workspace/db/schema"
import { pickManyUnique, pickOne, randomDateWithinDays, randomInt } from "../lib/faker"

const SEARCH_TERMS = [
  "gift for brother",
  "birthday surprise",
  "premium anniversary gift",
  "office desk accessories",
  "budget gifting options",
  "wellness hamper",
]

const VIEW_SOURCES = ["search", "category", "recommendation", "direct"]
const ORDER_STATUSES = ["paid", "shipped", "delivered", "cancelled"] as const

interface UserSeedContext {
  id: string
  createdAt: Date
}

interface ProductSeedContext {
  id: string
  category: string
  price: string
  occasions: string[] | null
  recipientTypes: string[] | null
}

function buildSessionId(userId: string): string {
  return `seed-session-${userId.slice(0, 8)}-${randomInt(1000, 9999)}`
}

export async function seedEvents(): Promise<void> {
  const seededUsers = (await db
    .select({ id: users.id, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.role, "user"))) as UserSeedContext[]

  const seededProducts = (await db
    .select({
      id: products.id,
      category: products.category,
      price: products.price,
      occasions: products.occasions,
      recipientTypes: products.recipientTypes,
    })
    .from(products)
    .where(ne(products.category, ""))) as ProductSeedContext[]

  if (seededUsers.length === 0 || seededProducts.length === 0) {
    return
  }

  for (const user of seededUsers) {
    const interactions = randomInt(12, 26)
    const touchedProductIds: string[] = []
    const sessionId = buildSessionId(user.id)
    let viewCount = 0
    let cartAddCount = 0
    let wishlistAddCount = 0
    let searchCount = 0
    let purchaseCount = 0
    const categoryAffinity: Record<string, number> = {}
    const seenOccasions: Record<string, number> = {}
    const seenRecipients: Record<string, number> = {}
    let avgOrderAccumulator = 0

    for (let i = 0; i < interactions; i += 1) {
      const product = pickOne(seededProducts)
      const occurredAt = randomDateWithinDays(120)
      const source = pickOne(VIEW_SOURCES)
      touchedProductIds.push(product.id)
      viewCount += 1
      categoryAffinity[product.category] = (categoryAffinity[product.category] ?? 0) + 1
      for (const occ of product.occasions ?? []) {
        seenOccasions[occ] = (seenOccasions[occ] ?? 0) + 1
      }
      for (const rec of product.recipientTypes ?? []) {
        seenRecipients[rec] = (seenRecipients[rec] ?? 0) + 1
      }

      await db.insert(productViews).values({
        userId: user.id,
        sessionId,
        productId: product.id,
        duration: randomInt(10, 400),
        source,
        createdAt: occurredAt,
      })

      await db.insert(userEvents).values({
        userId: user.id,
        productId: product.id,
        sessionId,
        eventType: "product_view",
        source,
        occurredAt,
        metadata: { seeded: true },
        createdAt: occurredAt,
        updatedAt: occurredAt,
      })

      if (Math.random() < 0.58) {
        cartAddCount += 1
        const quantity = randomInt(1, 3)
        await db.insert(cartEvents).values({
          userId: user.id,
          sessionId,
          productId: product.id,
          action: "add",
          quantity,
          metadata: { seeded: true },
          createdAt: occurredAt,
        })
        await db.insert(userEvents).values({
          userId: user.id,
          productId: product.id,
          sessionId,
          eventType: "cart_add",
          source: "cart",
          occurredAt,
          metadata: { quantity, seeded: true },
          createdAt: occurredAt,
          updatedAt: occurredAt,
        })
      }

      if (Math.random() < 0.35) {
        wishlistAddCount += 1
        await db.insert(wishlistEvents).values({
          userId: user.id,
          sessionId,
          productId: product.id,
          action: "add",
          metadata: { seeded: true },
          createdAt: occurredAt,
        })
      }

      if (Math.random() < 0.45) {
        searchCount += 1
        const query = pickOne(SEARCH_TERMS)
        await db.insert(searchLogs).values({
          userId: user.id,
          sessionId,
          query,
          resultCount: randomInt(3, 40),
          selectedProductId: product.id,
          filters: { category: product.category },
          metadata: { seeded: true },
          createdAt: occurredAt,
        })
        await db.insert(userEvents).values({
          userId: user.id,
          productId: product.id,
          sessionId,
          eventType: "search_select",
          source: "search",
          occurredAt,
          metadata: { query, seeded: true },
          createdAt: occurredAt,
          updatedAt: occurredAt,
        })
      }

      if (Math.random() < 0.18) {
        purchaseCount += 1
        const orderCreatedAt = randomDateWithinDays(80)
        const orderProductIds = pickManyUnique(touchedProductIds, randomInt(1, 3))
        const orderProducts = seededProducts.filter((p) => orderProductIds.includes(p.id))
        const total = orderProducts.reduce((sum, p) => sum + Number(p.price), 0)
        avgOrderAccumulator += total
        const [orderRow] = await db
          .insert(orders)
          .values({
            userId: user.id,
            status: pickOne(ORDER_STATUSES),
            totalAmount: total.toFixed(2),
            currency: "INR",
            createdAt: orderCreatedAt,
            updatedAt: orderCreatedAt,
          })
          .returning({ id: orders.id })

        if (orderRow) {
          for (const p of orderProducts) {
            await db.insert(orderItems).values({
              orderId: orderRow.id,
              productId: p.id,
              productName: `Seeded ${p.category} Product`,
              productImage: `https://picsum.photos/seed/order-${p.id}/400/400`,
              quantity: 1,
              priceAtPurchase: Number(p.price).toFixed(2),
              createdAt: orderCreatedAt,
              updatedAt: orderCreatedAt,
            })
          }
        }
      }
    }

    const topOccasions = Object.entries(seenOccasions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([occasion, count]) => ({ occasion, count }))
    const topRecipients = Object.entries(seenRecipients)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }))
    const totalInteractions =
      viewCount + cartAddCount + wishlistAddCount + searchCount + purchaseCount
    const segment =
      totalInteractions > 45
        ? "power_user"
        : totalInteractions > 28
          ? "engaged"
          : totalInteractions > 14
            ? "casual"
            : "new"

    const [existingProfile] = await db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))

    const profilePayload = {
      categoryAffinities: categoryAffinity,
      avgOrderValue: purchaseCount > 0 ? avgOrderAccumulator / purchaseCount : null,
      preferredPriceRange: {
        min: 500,
        max: purchaseCount > 0 ? 6000 : 2500,
      },
      totalViews: viewCount,
      totalPurchases: purchaseCount,
      totalSearches: searchCount,
      totalCartAdds: cartAddCount,
      totalWishlistAdds: wishlistAddCount,
      behavioralTags: [
        purchaseCount > 3 ? "repeat_buyer" : "explorer",
        cartAddCount > 5 ? "high_intent" : "browser",
      ],
      topOccasions,
      topRecipients,
      segment,
      lastActiveAt: randomDateWithinDays(7),
      updatedAt: new Date(),
    }

    if (existingProfile) {
      await db
        .update(userProfiles)
        .set(profilePayload)
        .where(eq(userProfiles.userId, user.id))
    } else {
      await db.insert(userProfiles).values({
        userId: user.id,
        ...profilePayload,
        createdAt: randomDateWithinDays(90),
      })
    }

    const candidateRecommendations = pickManyUnique(seededProducts, 8).map((product) => ({
      productId: product.id,
      score: Number((Math.random() * 0.4 + 0.6).toFixed(4)),
      reason: `Matched ${product.category} affinity`,
    }))

    await db.insert(recommendationCache).values({
      userId: user.id,
      strategy: "hybrid",
      recommendations: candidateRecommendations,
      context: {
        seeded: true,
        basedOn: ["views", "cart_events", "wishlist", "search"],
      },
      score: Number((Math.random() * 0.25 + 0.72).toFixed(4)),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      createdAt: new Date(),
    })
  }

  // Keep only recent seeded recommendation batches per user.
  const recRows = await db
    .select({
      id: recommendationCache.id,
      userId: recommendationCache.userId,
      createdAt: recommendationCache.createdAt,
    })
    .from(recommendationCache)
    .where(
      and(
        eq(recommendationCache.strategy, "hybrid"),
        inArray(
          recommendationCache.userId,
          seededUsers.map((u) => u.id)
        )
      )
    )

  const latestByUser = new Map<string, string>()
  for (const row of recRows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())) {
    if (!latestByUser.has(row.userId)) {
      latestByUser.set(row.userId, row.id)
    }
  }
  const staleIds = recRows
    .filter((row) => latestByUser.get(row.userId) !== row.id)
    .map((row) => row.id)
  if (staleIds.length > 0) {
    await db.delete(recommendationCache).where(inArray(recommendationCache.id, staleIds))
  }
}
