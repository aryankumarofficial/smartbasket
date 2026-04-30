import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createCartEvent, listCartItems, removeCartItem, upsertCartItem } from "@workspace/db/queries/index"
import { requireAccessUser } from "@/src/lib/auth/api-auth"

const upsertSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
  sessionId: z.string().optional(),
})

const removeSchema = z.object({
  productId: z.string().uuid(),
  sessionId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAccessUser(request)
    const items = await listCartItems(user.sub)
    return NextResponse.json({ items })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load cart"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAccessUser(request)
    const body = upsertSchema.parse(await request.json())
    const item = await upsertCartItem({
      userId: user.sub,
      productId: body.productId,
      quantity: body.quantity,
    })
    await createCartEvent({
      userId: user.sub,
      sessionId: body.sessionId,
      productId: body.productId,
      action: "add",
      quantity: body.quantity,
      metadata: { source: "user_cart_api" },
    })
    return NextResponse.json({ item })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Failed to update cart"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAccessUser(request)
    const body = upsertSchema.parse(await request.json())
    const item = await upsertCartItem({
      userId: user.sub,
      productId: body.productId,
      quantity: body.quantity,
    })
    await createCartEvent({
      userId: user.sub,
      sessionId: body.sessionId,
      productId: body.productId,
      action: "update_quantity",
      quantity: body.quantity,
      metadata: { source: "user_cart_api" },
    })
    return NextResponse.json({ item })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Failed to update cart"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAccessUser(request)
    const params = request.nextUrl.searchParams
    const payload = removeSchema.parse({
      productId: params.get("productId"),
      sessionId: params.get("sessionId") ?? undefined,
    })
    const result = await removeCartItem(user.sub, payload.productId)
    await createCartEvent({
      userId: user.sub,
      sessionId: payload.sessionId,
      productId: payload.productId,
      action: "remove",
      quantity: 1,
      metadata: { source: "user_cart_api" },
    })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Failed to remove item"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
