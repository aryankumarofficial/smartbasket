"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { staleTimeFast } from "@/src/lib/query-client"
import { orderKeys } from "@/src/hooks/queries/keys"
import * as orderService from "@/src/services/order.service"

export function useOrdersQuery() {
  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: () => orderService.listOrders(),
    staleTime: staleTimeFast,
    retry: 2,
  })
}

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: orderService.placeOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
