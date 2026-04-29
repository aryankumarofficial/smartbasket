import { NextResponse } from "next/server"
import { analyticsController } from "@/src/modules/analytics/controller"

export async function GET() {
  try {
    return analyticsController.getSnapshot()
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch analytics"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
