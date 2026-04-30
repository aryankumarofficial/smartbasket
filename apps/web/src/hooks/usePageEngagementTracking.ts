"use client"

import { useEffect } from "react"

import { useTrackingIdentity } from "@/src/hooks/useTrackingIdentity"
import { ingestTrackingEvents } from "@/src/services/events.service"

export function usePageEngagementTracking(pageKey: string) {
  const identity = useTrackingIdentity()

  useEffect(() => {
    if (!identity.sessionId) return
    const startedAt = performance.now()
    const now = new Date().toISOString()

    void ingestTrackingEvents([
      {
        eventType: "page_view",
        sessionId: identity.sessionId,
        userId: identity.userId ?? undefined,
        anonymousId: identity.anonymousId ?? undefined,
        timestamp: now,
        source: "user_app",
        metadata: { page: pageKey },
      },
    ]).catch(() => {})

    return () => {
      const durationMs = Math.max(0, Math.round(performance.now() - startedAt))
      void ingestTrackingEvents([
        {
          eventType: "page_view",
          sessionId: identity.sessionId ?? undefined,
          userId: identity.userId ?? undefined,
          anonymousId: identity.anonymousId ?? undefined,
          timestamp: new Date().toISOString(),
          source: "user_app",
          metadata: { page: pageKey, durationMs, event: "page_exit" },
        },
      ]).catch(() => {})
    }
  }, [identity.anonymousId, identity.sessionId, identity.userId, pageKey])
}
