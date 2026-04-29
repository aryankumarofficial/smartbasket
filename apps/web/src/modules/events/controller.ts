import { NextRequest, NextResponse } from "next/server"
import { eventsService } from "./service"
import type { TrackingEvent } from "@/lib/types/events"

export const eventsController = {
  async ingest(request: NextRequest) {
    const body = (await request.json()) as
      | TrackingEvent
      | { events: TrackingEvent[] }
    const events = "events" in body ? body.events : [body]
    const result = await eventsService.ingest(events)
    return NextResponse.json({ success: true, ...result })
  },
}
