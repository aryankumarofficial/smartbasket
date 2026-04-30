"use client"

import { useEffect, useRef } from "react"

import { ingestTrackingEvents } from "@/src/services/events.service"
import { useTrackingIdentity } from "@/src/hooks/useTrackingIdentity"

const STARTED_MARK = "sb_session_event_sent"

export function SessionTrackingBootstrap() {
  const identity = useTrackingIdentity()
  const sentRef = useRef(false)

  useEffect(() => {
    if (!identity.ready || sentRef.current) {
      return
    }

    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(STARTED_MARK)) {
        return
      }

      sentRef.current = true
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STARTED_MARK, "1")
      }

      void ingestTrackingEvents([
        {
          eventType: "session_start",
          sessionId: identity.sessionId ?? undefined,
          userId: identity.userId ?? undefined,
          anonymousId: identity.anonymousId ?? undefined,
          source: "public_storefront",
          timestamp: new Date().toISOString(),
          metadata: {
            path: typeof window !== "undefined" ? window.location.pathname : "/",
          },
        },
      ]).catch(() => {})
    } catch {
      sentRef.current = false
    }
  }, [identity])

  return null
}
