import { apiFetch } from "@/src/lib/api"
import type { OrderListResponse } from "@/src/types/order"
import type { UserOrderDetail } from "@/src/types/user-system"

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

export async function listOrdersByStatus(status?: string): Promise<OrderListResponse> {
  if (!status) return listOrders()
  const q = new URLSearchParams({ status })
  return apiFetch<OrderListResponse>(`/api/orders?${q}`)
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResponse> {
  return apiFetch<PlaceOrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function getOrderDetail(orderId: string): Promise<UserOrderDetail> {
  return apiFetch<UserOrderDetail>(`/api/orders/${encodeURIComponent(orderId)}`)
}
