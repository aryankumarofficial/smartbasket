"use client"

import { useQuery } from "@tanstack/react-query"

import { staleTimeCatalog } from "@/src/lib/query-client"
import { adminKeys } from "@/src/hooks/queries/adminKeys"
import * as adminStatsService from "@/src/services/admin-stats.service"

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => adminStatsService.fetchAdminDashboardStats(),
    staleTime: staleTimeCatalog,
  })
}
