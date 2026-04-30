import { apiFetch } from "@/src/lib/api"
import type { CartResponse } from "@/src/types/user-system"

export function getUserCart() {
  return apiFetch<CartResponse>("/api/user/cart")
}

export function addCartItem(input: { productId: string; quantity: number; sessionId?: string }) {
  return apiFetch<{ item: unknown }>("/api/user/cart", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateCartItem(input: { productId: string; quantity: number; sessionId?: string }) {
  return apiFetch<{ item: unknown }>("/api/user/cart", {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function removeCartItem(input: { productId: string; sessionId?: string }) {
  const q = new URLSearchParams({ productId: input.productId })
  if (input.sessionId) q.set("sessionId", input.sessionId)
  return apiFetch<{ removed: boolean }>(`/api/user/cart?${q}`, {
    method: "DELETE",
  })
}
