import { desc, eq } from "drizzle-orm"

import { db } from "../client"
import { wishlistEvents } from "../schema/wishlist-events"

export async function listWishlistState(userId: string) {
  const events = await db
    .select({
      productId: wishlistEvents.productId,
      action: wishlistEvents.action,
      createdAt: wishlistEvents.createdAt,
    })
    .from(wishlistEvents)
    .where(eq(wishlistEvents.userId, userId))
    .orderBy(desc(wishlistEvents.createdAt))

  const latest = new Map<string, "add" | "remove">()
  for (const row of events) {
    const key = row.productId
    if (latest.has(key)) continue
    latest.set(key, row.action === "remove" ? "remove" : "add")
  }

  const activeIds = [...latest.entries()]
    .filter(([, action]) => action === "add")
    .map(([productId]) => productId)

  if (activeIds.length === 0) {
    return []
  }

  const products = await db.query.products.findMany()
  const productMap = new Map(products.map((p) => [p.id, p]))
  return activeIds.map((id) => productMap.get(id)).filter(Boolean)
}
