import { and, eq } from "drizzle-orm"

import { db } from "../client"
import { cartItems, carts } from "../schema/carts"
import { products } from "../schema/products"

async function getOrCreateCart(userId: string) {
  const existing = await db.query.carts.findFirst({
    where: eq(carts.userId, userId),
  })
  if (existing) return existing

  const [created] = await db.insert(carts).values({ userId }).returning()
  if (!created) {
    throw new Error("Could not initialize cart")
  }
  return created
}

export async function listCartItems(userId: string) {
  const cart = await getOrCreateCart(userId)

  return db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      priceAtAdd: cartItems.priceAtAdd,
      productName: products.name,
      productImage: products.imageUrl,
      productCategory: products.category,
      inStock: products.inStock,
      inventoryCount: products.inventoryCount,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id))
}

export async function upsertCartItem(input: {
  userId: string
  productId: string
  quantity: number
}) {
  const cart = await getOrCreateCart(input.userId)
  const qty = Math.max(1, input.quantity)

  const product = await db.query.products.findFirst({
    where: eq(products.id, input.productId),
  })
  if (!product) {
    throw new Error("Product not found")
  }

  const existing = await db.query.cartItems.findFirst({
    where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, input.productId)),
  })

  if (existing) {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity: qty, updatedAt: new Date() })
      .where(eq(cartItems.id, existing.id))
      .returning()
    return updated
  }

  const [created] = await db
    .insert(cartItems)
    .values({
      cartId: cart.id,
      productId: input.productId,
      quantity: qty,
      priceAtAdd: String(product.price),
    })
    .returning()

  return created
}

export async function removeCartItem(userId: string, productId: string) {
  const cart = await db.query.carts.findFirst({
    where: eq(carts.userId, userId),
  })
  if (!cart) {
    return { removed: false }
  }

  const removed = await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
    .returning({ id: cartItems.id })

  return { removed: removed.length > 0 }
}
