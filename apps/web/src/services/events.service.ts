import { apiFetch } from "@/src/lib/api"
import type { EventBatch, TrackingEvent } from "@/lib/types/events"

export type EventsIngestResponse = {
  success: boolean
  processed: number
  dispatch: unknown
}

export async function ingestTrackingEvents(events: TrackingEvent[]): Promise<EventsIngestResponse> {
  const body: EventBatch = { events }
  return apiFetch<EventsIngestResponse>("/api/events", {
    method: "POST",
    body: JSON.stringify(body),
  })
}
