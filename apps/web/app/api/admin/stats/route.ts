import { NextRequest, NextResponse } from "next/server"

import { getAdminDashboardSnapshot } from "@workspace/db/queries/admin-stats"
import { requireAdminRequest } from "@/src/lib/auth/admin-guard"

export async function GET(request: NextRequest) {
  try {
    await requireAdminRequest(request)
    const fromRaw = request.nextUrl.searchParams.get("from")
    const toRaw = request.nextUrl.searchParams.get("to")
    const from = fromRaw ? new Date(fromRaw) : undefined
    const to = toRaw ? new Date(toRaw) : undefined
    if (from && Number.isNaN(from.getTime())) {
      return NextResponse.json({ error: "Invalid from date" }, { status: 400 })
    }
    if (to && Number.isNaN(to.getTime())) {
      return NextResponse.json({ error: "Invalid to date" }, { status: 400 })
    }
    const snapshot = await getAdminDashboardSnapshot(
      from || to ? { from, to } : undefined
    )
    return NextResponse.json(snapshot)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load stats"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
