import { NextRequest, NextResponse } from "next/server"

import { getAdminDashboardSnapshot } from "@workspace/db/queries/admin-stats"
import { requireAdminRequest } from "@/src/lib/auth/admin-guard"

export async function GET(request: NextRequest) {
  try {
    await requireAdminRequest(request)
    const snapshot = await getAdminDashboardSnapshot()
    return NextResponse.json(snapshot)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load stats"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
