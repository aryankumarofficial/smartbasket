"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import type { TrackingIdentity } from "@/src/hooks/useTrackingIdentity"
import { ingestTrackingEvents } from "@/src/services/events.service"

/** Fire PRODUCT_VIEW + PRODUCT_VIEW_END (duration ms) feeding ML pipelines. */
export function useProductViewTracking(
  identity: TrackingIdentity,
  productId: string | undefined,
  opts?: { source?: string }
) {
  const pathname = usePathname()
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (!productId || !identity.ready || !identity.sessionId) {
      return
    }

    const sessionId = identity.sessionId
    const userId = identity.userId ?? undefined
    const anonymousId = identity.anonymousId ?? undefined

    startRef.current = performance.now()

    void ingestTrackingEvents([
      {
        eventType: "product_view",
        productId,
        sessionId,
        userId,
        anonymousId,
        source: opts?.source ?? "storefront_product",
        timestamp: new Date().toISOString(),
        metadata: { path: pathname, product_id: productId },
      },
    ]).catch(() => {})

    return () => {
      const elapsed = Math.max(0, Math.round(performance.now() - startRef.current))

      void ingestTrackingEvents([
        {
          eventType: "product_view_end",
          productId,
          sessionId,
          userId,
          anonymousId,
          source: opts?.source ?? "storefront_product",
          timestamp: new Date().toISOString(),
          metadata: { duration: elapsed, path: pathname, product_id: productId },
        },
      ]).catch(() => {})
    }
  }, [
    productId,
    identity.ready,
    identity.sessionId,
    identity.userId,
    identity.anonymousId,
    pathname,
    opts?.source,
  ])
}
