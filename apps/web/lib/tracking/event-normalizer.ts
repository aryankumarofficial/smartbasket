import { randomUUID } from "crypto"
import type {
  EventBatch,
  NormalizedTrackingEvent,
  TrackingEvent,
} from "../types/events"

const EVENT_TYPES = new Set([
  "product_view",
  "product_view_end",
  "cart_add",
  "cart_remove",
  "cart_update_quantity",
  "wishlist_add",
  "wishlist_remove",
  "search",
  "search_click",
  "purchase",
  "page_view",
  "session_start",
  "session_end",
])

export function normalizeEventBatch(
  payload: TrackingEvent | EventBatch
): NormalizedTrackingEvent[] {
  const events = "events" in payload ? payload.events : [payload]
  return events.map(normalizeSingleEvent)
}

function normalizeSingleEvent(
  event: TrackingEvent
): NormalizedTrackingEvent {
  if (!EVENT_TYPES.has(event.eventType)) {
    throw new Error(`Unsupported eventType: ${event.eventType}`)
  }

  if (!event.userId && !event.sessionId && !event.anonymousId) {
    throw new Error(
      "Event must include at least one identity: userId, sessionId, or anonymousId"
    )
  }

  if (
    [
      "product_view",
      "product_view_end",
      "cart_add",
      "cart_remove",
      "cart_update_quantity",
      "wishlist_add",
      "wishlist_remove",
    ].includes(event.eventType) &&
    !event.productId
  ) {
    throw new Error(
      `productId is required for eventType: ${event.eventType}`
    )
  }

  const occurredAt = event.timestamp
    ? new Date(event.timestamp)
    : new Date()
  if (Number.isNaN(occurredAt.getTime())) {
    throw new Error("Invalid timestamp")
  }

  return {
    eventType: event.eventType,
    eventId: event.eventId ?? randomUUID(),
    userId: event.userId,
    anonymousId: event.anonymousId,
    sessionId: event.sessionId,
    productId: event.productId,
    source: event.source,
    metadata: event.metadata,
    occurredAt: occurredAt.toISOString(),
  }
}
