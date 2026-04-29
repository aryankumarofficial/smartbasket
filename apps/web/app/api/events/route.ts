import { NextRequest, NextResponse } from "next/server"
import { eventTrackingService } from "@/lib/services/event-tracking.service"
import { normalizeEventBatch } from "@/lib/tracking/event-normalizer"
import type { EventBatch, TrackingEvent } from "@/lib/types/events"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as
      | TrackingEvent
      | EventBatch

    const normalized = normalizeEventBatch(body)
    const dispatch = await eventTrackingService.ingestAndDispatch(
      normalized
    )

    return NextResponse.json({
      success: true,
      processed: normalized.length,
      dispatch,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process event"
    console.error("POST /api/events error:", error)
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
