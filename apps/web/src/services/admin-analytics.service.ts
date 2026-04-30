import { apiFetch } from "@/src/lib/api"
import type { AnalyticsSnapshot } from "@/src/modules/analytics/types"

export async function fetchAdminAnalytics(includeJobs = false) {
  const q = includeJobs ? "?includeJobs=1" : ""
  return apiFetch<AnalyticsSnapshot & { jobs?: unknown; jobsError?: string }>(
    `/api/admin/analytics${q}`
  )
}
