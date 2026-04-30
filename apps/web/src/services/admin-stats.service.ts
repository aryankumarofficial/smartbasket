import { apiFetch } from "@/src/lib/api"
import type { AdminDashboardStats } from "@/src/types/admin"

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  return apiFetch<AdminDashboardStats>("/api/admin/stats")
}
