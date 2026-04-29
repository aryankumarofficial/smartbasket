import type { TrackingEvent } from "@/lib/types/events"

export interface EventIngestionRequest {
  events: TrackingEvent[]
}
