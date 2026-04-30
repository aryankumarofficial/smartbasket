import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { updateOrderStatus } from "@workspace/db/queries/order-admin"
import { requireAdminRequest } from "@/src/lib/auth/admin-guard"

const patchSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRequest(request)
    const { id } = await params
    const body = patchSchema.parse(await request.json())
    const updated = await updateOrderStatus(id, body.status)
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json({ order: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid body", details: error.flatten() }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Failed to update order"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
