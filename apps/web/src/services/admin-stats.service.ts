import { apiFetch } from "@/src/lib/api"
import type { AdminDashboardStats } from "@/src/types/admin"

export async function fetchAdminDashboardStats(
  range?: { from?: string; to?: string }
): Promise<AdminDashboardStats> {
  const sp = new URLSearchParams()
  if (range?.from) sp.set("from", range.from)
  if (range?.to) sp.set("to", range.to)
  const q = sp.toString()
  return apiFetch<AdminDashboardStats>(`/api/admin/stats${q ? `?${q}` : ""}`)
}
