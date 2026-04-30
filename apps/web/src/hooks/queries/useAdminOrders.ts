"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { staleTimeFast } from "@/src/lib/query-client"
import { adminKeys } from "@/src/hooks/queries/adminKeys"
import * as adminOrderService from "@/src/services/admin-order.service"

export type AdminOrderListFilters = {
  limit?: number
  status?: string
  q?: string
  from?: string
  to?: string
}

export function useAdminOrdersQuery(filters?: AdminOrderListFilters) {
  return useQuery({
    queryKey: adminKeys.orderList(filters),
    queryFn: () => adminOrderService.listAdminOrders(filters),
    staleTime: staleTimeFast,
  })
}

export function useAdminOrderQuery(id: string | null) {
  return useQuery({
    queryKey: adminKeys.order(id ?? ""),
    queryFn: () => adminOrderService.getAdminOrder(id as string),
    enabled: Boolean(id),
    staleTime: staleTimeFast,
  })
}

export function useUpdateOrderStatusMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminOrderService.updateOrderStatus(id, status),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: adminKeys.orders })
      void qc.invalidateQueries({ queryKey: ["admin", "stats"] })
      void qc.invalidateQueries({ queryKey: adminKeys.order(v.id) })
    },
  })
}
