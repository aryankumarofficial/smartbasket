"use client"

import { useMutation } from "@tanstack/react-query"
import type { TrackingEvent } from "@/lib/types/events"

import { ingestTrackingEvents } from "@/src/services/events.service"
import type { TrackingIdentity } from "@/src/hooks/useTrackingIdentity"

function annotateWithIdentity<E extends TrackingEvent>(
  events: E[],
  id: TrackingIdentity
): TrackingEvent[] {
  return events.map((e) => ({
    ...e,
    userId: e.userId ?? id.userId ?? undefined,
    anonymousId: e.anonymousId ?? id.anonymousId ?? undefined,
    sessionId: e.sessionId ?? id.sessionId ?? undefined,
  }))
}

export function useEmitTracking(id: TrackingIdentity) {
  return useMutation({
    mutationFn: async (events: TrackingEvent[]) => {
      const next = annotateWithIdentity(events, id).map((ev) =>
        ev.timestamp ? ev : { ...ev, timestamp: new Date().toISOString() }
      )
      return ingestTrackingEvents(next)
    },
  })
}
