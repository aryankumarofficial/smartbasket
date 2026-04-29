"use client"

import { useEffect, useCallback, useRef } from "react"
import { tracker } from "@/lib/tracking/event-tracker"

export function useTracking(userId?: string) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      tracker.init(userId)
      initialized.current = true
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      tracker.setUserId(userId)
    }
  }, [userId])

  const trackProductView = useCallback(
    (productId: string, source?: string) => {
      return tracker.trackProductView(productId, source)
    },
    []
  )

  const trackCartAdd = useCallback(
    (productId: string, quantity?: number) => {
      tracker.trackCartAdd(productId, quantity)
    },
    []
  )

  const trackCartRemove = useCallback(
    (productId: string, quantity?: number) => {
      tracker.trackCartRemove(productId, quantity)
    },
    []
  )

  const trackWishlistAdd = useCallback((productId: string) => {
    tracker.trackWishlistAdd(productId)
  }, [])

  const trackWishlistRemove = useCallback((productId: string) => {
    tracker.trackWishlistRemove(productId)
  }, [])

  const trackSearch = useCallback(
    (
      query: string,
      filters?: Record<string, unknown>,
      resultCount?: number
    ) => {
      tracker.trackSearch(query, filters, resultCount)
    },
    []
  )

  const trackSearchClick = useCallback(
    (query: string, productId: string) => {
      tracker.trackSearchClick(query, productId)
    },
    []
  )

  const trackPurchase = useCallback(
    (
      productId: string,
      metadata?: Record<string, unknown>
    ) => {
      tracker.trackPurchase(productId, metadata)
    },
    []
  )

  return {
    trackProductView,
    trackCartAdd,
    trackCartRemove,
    trackWishlistAdd,
    trackWishlistRemove,
    trackSearch,
    trackSearchClick,
    trackPurchase,
  }
}
