import { NextRequest, NextResponse } from "next/server"

import { listOrdersWithUsers } from "@workspace/db/queries/order-admin"
import { requireAdminRequest } from "@/src/lib/auth/admin-guard"

export async function GET(request: NextRequest) {
  try {
    await requireAdminRequest(request)
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "100") || 100
    const orders = await listOrdersWithUsers(Math.min(limit, 200))
    return NextResponse.json({ orders })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list orders"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
