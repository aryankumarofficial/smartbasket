"use client"

import { useEffect, useMemo, useState } from "react"

import {
  getOrCreateAnonymousId,
  getOrCreateBrowserSessionId,
  resolveRecommendationUserId,
} from "@/src/lib/identity/browser-identity"
import { useAuthStore } from "@/src/stores/auth.store"

export type TrackingIdentity = {
  userId: string | undefined
  anonymousId: string | null
  sessionId: string | null
  /** Pass to `/api/recommendations` — stable per visitor. */
  recommendationUserId: string
  ready: boolean
}

/** Client-safe identity bundle for analytics + ML recommendation userId routing. */
export function useTrackingIdentity(): TrackingIdentity {
  const authUserId = useAuthStore((s) => s.user?.id)
  const [anonymousId, setAnonymousId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    queueMicrotask(() => {
      setAnonymousId(getOrCreateAnonymousId())
      setSessionId(getOrCreateBrowserSessionId())
    })
  }, [])

  const recommendationUserId = useMemo(() => {
    return resolveRecommendationUserId(authUserId, anonymousId)
  }, [authUserId, anonymousId])

  return {
    userId: authUserId,
    anonymousId,
    sessionId,
    recommendationUserId,
    ready: Boolean(sessionId && (authUserId != null || anonymousId != null)),
  }
}
