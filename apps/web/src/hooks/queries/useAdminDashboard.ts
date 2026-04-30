"use client"

import { useQuery } from "@tanstack/react-query"

import { staleTimeCatalog } from "@/src/lib/query-client"
import { adminKeys } from "@/src/hooks/queries/adminKeys"
import * as adminStatsService from "@/src/services/admin-stats.service"

export function useAdminDashboardQuery(range?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: adminKeys.stats(range),
    queryFn: () => adminStatsService.fetchAdminDashboardStats(range),
    staleTime: staleTimeCatalog,
  })
}
