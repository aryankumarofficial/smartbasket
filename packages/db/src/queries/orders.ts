import { desc, eq } from "drizzle-orm"

import { db } from "../client.js"
import { cartItems, carts } from "../schema/carts.js"
import { orderItems, orders } from "../schema/orders.js"
import { products } from "../schema/products.js"
import { users } from "../schema/users.js"

export async function getOrderById(orderId: string) {
  const [row] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  return row ?? null
}

export async function listOrdersForUser(userId: string) {
  return db
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
}

export async function getOrderEmailContext(orderId: string) {
  const [orderRow] = await db
    .select({
      orderId: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      userId: orders.userId,
      userEmail: users.email,
      userName: users.name,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!orderRow) return null

  const items = await db
    .select({
      productName: orderItems.productName,
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      productImage: orderItems.productImage,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  return { ...orderRow, items }
}

export async function placeOrderFromCart(userId: string) {
  return db.transaction(async (tx) => {
    const [cart] = await tx.select().from(carts).where(eq(carts.userId, userId)).limit(1)

    if (!cart) {
      throw new Error("Cart is empty")
    }

    const rows = await tx
      .select({
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        priceAtAdd: cartItems.priceAtAdd,
        productName: products.name,
        productImage: products.imageUrl,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id))

    if (rows.length === 0) {
      throw new Error("Cart is empty")
    }

    let totalCents = 0
    for (const r of rows) {
      const unit = Number(r.priceAtAdd)
      totalCents += Math.round(unit * 100) * r.quantity
    }
    const totalAmount = (totalCents / 100).toFixed(2)

    const [order] = await tx
      .insert(orders)
      .values({
        userId,
        status: "paid",
        totalAmount,
        currency: "INR",
      })
      .returning()

    if (!order) {
      throw new Error("Order could not be created")
    }

    await tx.insert(orderItems).values(
      rows.map((r) => ({
        orderId: order.id,
        productId: r.productId,
        productName: r.productName,
        productImage: r.productImage,
        quantity: r.quantity,
        priceAtPurchase: r.priceAtAdd,
      }))
    )

    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id))

    return {
      order,
      items: rows.map((r) => ({
        productName: r.productName,
        quantity: r.quantity,
        priceAtPurchase: String(r.priceAtAdd),
        productImage: r.productImage,
      })),
    }
  })
}
