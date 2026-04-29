"use client"

import type { TrackingEvent, EventType } from "../types/events"

const BATCH_SIZE = 10
const FLUSH_INTERVAL_MS = 5000

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

class EventTracker {
  private queue: TrackingEvent[] = []
  private sessionId: string
  private userId: string | null = null
  private flushTimer: ReturnType<typeof setInterval> | null = null
  private isInitialized = false

  constructor() {
    this.sessionId = generateSessionId()
  }

  init(userId?: string): void {
    if (this.isInitialized) return

    if (userId) {
      this.userId = userId
    }

    // Restore or create session
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("sb_session_id")
      if (stored) {
        this.sessionId = stored
      } else {
        sessionStorage.setItem("sb_session_id", this.sessionId)
      }
    }

    // Start flush timer
    this.flushTimer = setInterval(() => {
      this.flush()
    }, FLUSH_INTERVAL_MS)

    // Track session start
    this.track("session_start", undefined, {
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      deviceType: this.getDeviceType(),
    })

    // Flush on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.track("session_end")
        this.flush()
      })
    }

    this.isInitialized = true
  }

  setUserId(userId: string): void {
    this.userId = userId
    // Link session to user
    this.track("session_start", undefined, { linked: true })
  }

  track(
    eventType: EventType,
    productId?: string,
    metadata?: Record<string, unknown>
  ): void {
    const event: TrackingEvent = {
      eventType,
      userId: this.userId ?? undefined,
      sessionId: this.sessionId,
      productId,
      metadata,
      timestamp: new Date().toISOString(),
    }

    this.queue.push(event)

    if (this.queue.length >= BATCH_SIZE) {
      this.flush()
    }
  }

  trackProductView(
    productId: string,
    source?: string
  ): () => void {
    const startTime = Date.now()

    this.track("product_view", productId, { source })

    // Return cleanup function that tracks view duration
    return () => {
      const duration = Math.round((Date.now() - startTime) / 1000)
      this.track("product_view_end", productId, { duration, source })
    }
  }

  trackCartAdd(productId: string, quantity = 1): void {
    this.track("cart_add", productId, { quantity })
  }

  trackCartRemove(productId: string, quantity = 1): void {
    this.track("cart_remove", productId, { quantity })
  }

  trackWishlistAdd(productId: string): void {
    this.track("wishlist_add", productId)
  }

  trackWishlistRemove(productId: string): void {
    this.track("wishlist_remove", productId)
  }

  trackSearch(
    query: string,
    filters?: Record<string, unknown>,
    resultCount?: number
  ): void {
    this.track("search", undefined, { query, filters, resultCount })
  }

  trackSearchClick(
    query: string,
    productId: string
  ): void {
    this.track("search_click", productId, {
      query,
      selectedProductId: productId,
    })
  }

  trackPurchase(
    productId: string,
    metadata?: Record<string, unknown>
  ): void {
    this.track("purchase", productId, metadata)
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
        keepalive: true, // important for beforeunload
      })

      if (!response.ok) {
        // Re-queue failed events
        this.queue.unshift(...events)
      }
    } catch {
      // Re-queue on network failure
      this.queue.unshift(...events)
    }
  }

  private getDeviceType(): string {
    if (typeof window === "undefined") return "unknown"
    const width = window.innerWidth
    if (width < 768) return "mobile"
    if (width < 1024) return "tablet"
    return "desktop"
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.flush()
    this.isInitialized = false
  }
}

export const tracker = new EventTracker()
