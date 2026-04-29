import { apiFetch } from "@/src/lib/api"
import type { OrderListResponse } from "@/src/types/order"

export interface PlaceOrderInput {
  /** Extend when checkout payload is finalized. */
  items: { productId: string; quantity: number }[]
}

export interface PlaceOrderResponse {
  orderId: string
}

export async function listOrders(): Promise<OrderListResponse> {
  return apiFetch<OrderListResponse>("/api/orders")
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResponse> {
  return apiFetch<PlaceOrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  })
}
