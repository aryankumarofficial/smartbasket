import { apiFetch } from "@/src/lib/api"
import type { WishlistResponse } from "@/src/types/user-system"

export function getUserWishlist() {
  return apiFetch<WishlistResponse>("/api/user/wishlist")
}

export function addWishlistItem(input: { productId: string; sessionId?: string }) {
  return apiFetch<{ ok: boolean }>("/api/user/wishlist", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function removeWishlistItem(input: { productId: string; sessionId?: string }) {
  const q = new URLSearchParams({ productId: input.productId })
  if (input.sessionId) q.set("sessionId", input.sessionId)
  return apiFetch<{ ok: boolean }>(`/api/user/wishlist?${q}`, {
    method: "DELETE",
  })
}
