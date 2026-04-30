"use client"

import { useQuery } from "@tanstack/react-query"

import { staleTimeCatalog } from "@/src/lib/query-client"
import { adminKeys } from "@/src/hooks/queries/adminKeys"
import * as adminAnalyticsService from "@/src/services/admin-analytics.service"

export function useAdminAnalyticsQuery(includeJobs = false) {
  return useQuery({
    queryKey: [...adminKeys.analytics, includeJobs ? "jobs" : "base"] as const,
    queryFn: () => adminAnalyticsService.fetchAdminAnalytics(includeJobs),
    staleTime: staleTimeCatalog,
  })
}
