import { NextRequest, NextResponse } from "next/server"
import { eventTrackingService } from "@/lib/services/event-tracking.service"
import type { TrackingEvent, EventBatch } from "@/lib/types/events"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as
      | TrackingEvent
      | EventBatch

    // Support both single event and batch
    if ("events" in body && Array.isArray(body.events)) {
      await eventTrackingService.ingestBatch(body.events)
      return NextResponse.json({
        success: true,
        processed: body.events.length,
      })
    }

    // Single event
    const event = body as TrackingEvent
    if (!event.eventType) {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      )
    }

    await eventTrackingService.ingestEvent(event)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/events error:", error)
    return NextResponse.json(
      { error: "Failed to process event" },
      { status: 500 }
    )
  }
}
