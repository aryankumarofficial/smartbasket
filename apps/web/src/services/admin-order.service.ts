import { apiFetch } from "@/src/lib/api"
import type { AdminOrdersResponse } from "@/src/types/admin"

export async function listAdminOrders(limit = 100) {
  return apiFetch<AdminOrdersResponse>(`/api/admin/orders?limit=${limit}`)
}

export async function updateOrderStatus(id: string, status: string) {
  return apiFetch<{ order: { id: string; status: string } }>(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
