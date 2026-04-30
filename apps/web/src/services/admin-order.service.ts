import { apiFetch } from "@/src/lib/api"
import type { AdminOrderDetailResponse, AdminOrdersResponse } from "@/src/types/admin"

export async function listAdminOrders(opts?: {
  limit?: number
  status?: string
  q?: string
  from?: string
  to?: string
}) {
  const sp = new URLSearchParams()
  if (opts?.limit !== undefined) sp.set("limit", String(opts.limit))
  if (opts?.status) sp.set("status", opts.status)
  if (opts?.q?.trim()) sp.set("q", opts.q.trim())
  if (opts?.from) sp.set("from", opts.from)
  if (opts?.to) sp.set("to", opts.to)
  const q = sp.toString()
  return apiFetch<AdminOrdersResponse>(`/api/admin/orders${q ? `?${q}` : ""}`)
}

export async function getAdminOrder(id: string) {
  return apiFetch<AdminOrderDetailResponse>(`/api/admin/orders/${encodeURIComponent(id)}`)
}

export async function updateOrderStatus(id: string, status: string) {
  return apiFetch<{ order: { id: string; status: string } }>(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
