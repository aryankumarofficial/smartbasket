import { NextRequest, NextResponse } from "next/server"

import { listOrdersForAdmin } from "@workspace/db/queries/order-admin"
import { requireAdminRequest } from "@/src/lib/auth/admin-guard"

export async function GET(request: NextRequest) {
  try {
    await requireAdminRequest(request)
    const sp = request.nextUrl.searchParams
    const limit = Number(sp.get("limit") ?? "100") || 100
    const status = sp.get("status") ?? undefined
    const q = sp.get("q") ?? undefined
    const fromRaw = sp.get("from")
    const toRaw = sp.get("to")
    const from = fromRaw ? new Date(fromRaw) : undefined
    const to = toRaw ? new Date(toRaw) : undefined
    const orders = await listOrdersForAdmin({
      limit: Math.min(limit, 200),
      status,
      q,
      from: from && !Number.isNaN(from.getTime()) ? from : undefined,
      to: to && !Number.isNaN(to.getTime()) ? to : undefined,
    })
    return NextResponse.json({ orders })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list orders"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
