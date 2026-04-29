import type { EventIngestionRequest } from "./types"

export function validateEventIngestionRequest(body: EventIngestionRequest) {
  if (!Array.isArray(body.events) || body.events.length === 0) {
    throw new Error("events must be a non-empty array")
  }
}
