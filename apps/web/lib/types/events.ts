export type EventType =
  | "product_view"
  | "product_view_end"
  | "cart_add"
  | "cart_remove"
  | "cart_update_quantity"
  | "wishlist_add"
  | "wishlist_remove"
  | "search"
  | "search_click"
  | "purchase"
  | "page_view"
  | "session_start"
  | "session_end"

export interface TrackingEvent {
  eventType: EventType
  eventId?: string
  userId?: string
  anonymousId?: string
  sessionId?: string
  productId?: string
  source?: string
  metadata?: Record<string, unknown>
  timestamp?: string
}

export interface ProductViewEvent extends TrackingEvent {
  eventType: "product_view" | "product_view_end"
  productId: string
  metadata?: {
    duration?: number
    source?: string
    [key: string]: unknown
  }
}

export interface CartEvent extends TrackingEvent {
  eventType: "cart_add" | "cart_remove" | "cart_update_quantity"
  productId: string
  metadata?: {
    quantity?: number
    [key: string]: unknown
  }
}

export interface WishlistEvent extends TrackingEvent {
  eventType: "wishlist_add" | "wishlist_remove"
  productId: string
}

export interface SearchEvent extends TrackingEvent {
  eventType: "search" | "search_click"
  metadata?: {
    query?: string
    filters?: Record<string, unknown>
    resultCount?: number
    selectedProductId?: string
    [key: string]: unknown
  }
}

export interface EventBatch {
  events: TrackingEvent[]
}

export interface NormalizedTrackingEvent {
  eventType: EventType
  eventId: string
  userId?: string
  anonymousId?: string
  sessionId?: string
  productId?: string
  source?: string
  metadata?: Record<string, unknown>
  occurredAt: string
}
