import { normalizeEventBatch } from "@/lib/tracking/event-normalizer"
import { eventsRepository } from "./repository"
import type { TrackingEvent } from "@/lib/types/events"

export const eventsService = {
  async ingest(events: TrackingEvent[]) {
    const normalized = normalizeEventBatch({ events })
    const dispatch = await eventsRepository.ingestAndDispatch(normalized)
    return { processed: normalized.length, dispatch }
  },
}
