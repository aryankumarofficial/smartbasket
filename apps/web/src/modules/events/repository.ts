import { eventTrackingService } from "@/lib/services/event-tracking.service"
import type { NormalizedTrackingEvent } from "@/lib/types/events"

export const eventsRepository = {
  ingestAndDispatch(events: NormalizedTrackingEvent[]) {
    return eventTrackingService.ingestAndDispatch(events)
  },
}
