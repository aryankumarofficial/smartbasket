import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireAccessUser } from "@/src/lib/auth/api-auth"
import type { OrderStatus } from "@/src/types/order"
import { enqueueEmailJob } from "@/src/queues/email.queue"
import { createEmailLog } from "@workspace/db/queries/email-log"
import { listOrdersForUser, placeOrderFromCart } from "@workspace/db/queries/orders"

const placeOrderBodySchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().positive(),
        })
      )
      .optional(),
  })
  .optional()

export async function GET(request: NextRequest) {
  try {
    const user = await requireAccessUser(request)
    const status = request.nextUrl.searchParams.get("status") ?? undefined
    const rows = await listOrdersForUser(user.sub)
    const filtered = status
      ? rows.filter((o) => o.status === status)
      : rows
    const orders = filtered.map((o) => ({
      id: o.id,
      status: o.status as OrderStatus,
      totalCents: Math.round(Number(o.totalAmount) * 100),
      updatedAt: o.updatedAt.toISOString(),
    }))
    return NextResponse.json({ orders })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list orders"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAccessUser(request)
    const json = await request.json().catch(() => ({}))
    placeOrderBodySchema.parse(json)

    const { order } = await placeOrderFromCart(user.sub)

    const log = await createEmailLog({
      userId: user.sub,
      recipientEmail: user.email,
      emailType: "SEND_ORDER_CONFIRMATION",
    })

    await enqueueEmailJob({
      type: "SEND_ORDER_CONFIRMATION",
      emailLogId: log.id,
      orderId: order.id,
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid body", details: error.flatten() },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : "Failed to place order"
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Cart is empty"
          ? 400
          : 400
    return NextResponse.json({ error: message }, { status })
  }
}
