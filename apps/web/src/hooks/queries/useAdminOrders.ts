"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { staleTimeFast } from "@/src/lib/query-client"
import { adminKeys } from "@/src/hooks/queries/adminKeys"
import * as adminOrderService from "@/src/services/admin-order.service"

export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: adminKeys.orders,
    queryFn: () => adminOrderService.listAdminOrders(),
    staleTime: staleTimeFast,
  })
}

export function useUpdateOrderStatusMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminOrderService.updateOrderStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.orders })
      void qc.invalidateQueries({ queryKey: adminKeys.stats })
    },
  })
}
