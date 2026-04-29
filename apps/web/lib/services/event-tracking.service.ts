import {
  createEvent,
  createProductView,
  createCartEvent,
  createWishlistEvent,
  createSearchLog,
  createSession,
  updateSessionActivity,
  endSession,
  linkSessionToUser,
} from "@workspace/db/queries/index"
import { dispatchDerivedJobs, type EventDispatchSummary } from "../workers/event-dispatcher"
import type {
  NormalizedTrackingEvent,
  TrackingEvent,
} from "../types/events"

export class EventTrackingService {
  async ingestEvent(event: NormalizedTrackingEvent): Promise<void> {
    const { eventType, userId, sessionId, productId, metadata } = event

    // Update session activity
    if (sessionId) {
      await updateSessionActivity(sessionId).catch(() => {
        // Session may not exist yet, ignore
      })
    }

    switch (eventType) {
      case "product_view":
        if (productId) {
          await createProductView({
            userId,
            sessionId,
            productId,
            source: metadata?.source as string | undefined,
            metadata,
          })
        }
        break

      case "product_view_end":
        if (productId) {
          await createProductView({
            userId,
            sessionId,
            productId,
            duration: metadata?.duration as number | undefined,
            source: metadata?.source as string | undefined,
            metadata,
          })
        }
        break

      case "cart_add":
      case "cart_remove":
      case "cart_update_quantity":
        if (userId && productId) {
          const action = eventType.replace("cart_", "")
          await createCartEvent({
            userId,
            sessionId,
            productId,
            action,
            quantity: (metadata?.quantity as number) ?? 1,
            metadata,
          })
        }
        break

      case "wishlist_add":
      case "wishlist_remove":
        if (userId && productId) {
          const action = eventType.replace("wishlist_", "")
          await createWishlistEvent({
            userId,
            sessionId,
            productId,
            action,
            metadata,
          })
        }
        break

      case "search":
        await createSearchLog({
          userId,
          sessionId,
          query: (metadata?.query as string) ?? "",
          filters: metadata?.filters as Record<string, unknown> | undefined,
          resultCount: metadata?.resultCount as number | undefined,
          metadata,
        })
        break

      case "search_click":
        await createSearchLog({
          userId,
          sessionId,
          query: (metadata?.query as string) ?? "",
          selectedProductId: metadata?.selectedProductId as
            | string
            | undefined,
          metadata,
        })
        break

      case "session_start":
        if (sessionId) {
          await createSession({
            sessionId,
            userId,
            userAgent: metadata?.userAgent as string | undefined,
            ipAddress: metadata?.ipAddress as string | undefined,
            deviceType: metadata?.deviceType as string | undefined,
            metadata,
          })
        }
        break

      case "session_end":
        if (sessionId) {
          await endSession(sessionId)
        }
        break

      default:
        break
    }

    // Always log to generic events table for full audit trail
    if (userId) {
      await createEvent({
        userId,
        productId,
        sessionId,
        anonymousId: event.anonymousId,
        eventId: event.eventId,
        eventType,
        source: event.source,
        occurredAt: new Date(event.occurredAt),
        metadata: { ...metadata, sessionId },
      })
    }
  }

  async ingestBatch(events: NormalizedTrackingEvent[]): Promise<void> {
    await Promise.allSettled(events.map((event) => this.ingestEvent(event)))
  }

  async ingestAndDispatch(
    events: NormalizedTrackingEvent[]
  ): Promise<EventDispatchSummary> {
    await this.ingestBatch(events)
    return dispatchDerivedJobs(events)
  }

  async linkSession(sessionId: string, userId: string): Promise<void> {
    await linkSessionToUser(sessionId, userId)
  }
}

export const eventTrackingService = new EventTrackingService()
