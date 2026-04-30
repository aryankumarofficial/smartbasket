import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db, orderItems, orders } from "@workspace/db"
import { requireAccessUser } from "@/src/lib/auth/api-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAccessUser(request)
    const { id } = await params

    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.userId, authUser.sub)),
    })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: orderItems.productName,
        productImage: orderItems.productImage,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, id))

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        totalAmount: String(order.totalAmount),
        currency: order.currency ?? "INR",
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
      items: items.map((item) => ({
        ...item,
        priceAtPurchase: String(item.priceAtPurchase),
      })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order detail"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
