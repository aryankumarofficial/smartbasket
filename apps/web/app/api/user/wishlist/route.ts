import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createWishlistEvent, listWishlistState } from "@workspace/db/queries/index"
import { requireAccessUser } from "@/src/lib/auth/api-auth"

const bodySchema = z.object({
  productId: z.string().uuid(),
  sessionId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAccessUser(request)
    const items = await listWishlistState(user.sub)
    return NextResponse.json({ items })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load wishlist"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAccessUser(request)
    const body = bodySchema.parse(await request.json())
    await createWishlistEvent({
      userId: user.sub,
      sessionId: body.sessionId,
      productId: body.productId,
      action: "add",
      metadata: { source: "user_wishlist_api" },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Failed to add wishlist item"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAccessUser(request)
    const payload = bodySchema.parse({
      productId: request.nextUrl.searchParams.get("productId"),
      sessionId: request.nextUrl.searchParams.get("sessionId") ?? undefined,
    })
    await createWishlistEvent({
      userId: user.sub,
      sessionId: payload.sessionId,
      productId: payload.productId,
      action: "remove",
      metadata: { source: "user_wishlist_api" },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Failed to remove wishlist item"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
