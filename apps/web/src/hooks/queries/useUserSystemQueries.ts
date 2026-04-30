"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { staleTimeFast } from "@/src/lib/query-client"
import { userKeys } from "@/src/hooks/queries/userKeys"
import * as cartService from "@/src/services/user-cart.service"
import * as wishlistService from "@/src/services/user-wishlist.service"
import * as accountService from "@/src/services/user-account.service"
import * as orderService from "@/src/services/order.service"

export function useUserCartQuery() {
  return useQuery({
    queryKey: userKeys.cart(),
    queryFn: () => cartService.getUserCart(),
    staleTime: staleTimeFast,
  })
}

export function useUserWishlistQuery() {
  return useQuery({
    queryKey: userKeys.wishlist(),
    queryFn: () => wishlistService.getUserWishlist(),
    staleTime: staleTimeFast,
  })
}

export function useUserAccountQuery() {
  return useQuery({
    queryKey: userKeys.account(),
    queryFn: () => accountService.getUserAccount(),
    staleTime: staleTimeFast,
  })
}

export function useUserOrdersQuery(status?: string) {
  return useQuery({
    queryKey: userKeys.orders(status),
    queryFn: () => orderService.listOrdersByStatus(status),
    staleTime: staleTimeFast,
  })
}

export function useUserOrderDetailQuery(orderId: string) {
  return useQuery({
    queryKey: userKeys.orderDetail(orderId),
    queryFn: () => orderService.getOrderDetail(orderId),
    enabled: Boolean(orderId),
    staleTime: staleTimeFast,
  })
}

export function useCartMutations() {
  const qc = useQueryClient()
  const onSuccess = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: userKeys.cart() }),
      qc.invalidateQueries({ queryKey: userKeys.orders() }),
    ])
  }
  return {
    add: useMutation({ mutationFn: cartService.addCartItem, onSuccess }),
    update: useMutation({ mutationFn: cartService.updateCartItem, onSuccess }),
    remove: useMutation({ mutationFn: cartService.removeCartItem, onSuccess }),
  }
}

export function useWishlistMutations() {
  const qc = useQueryClient()
  const onSuccess = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: userKeys.wishlist() }),
      qc.invalidateQueries({ queryKey: userKeys.cart() }),
    ])
  }
  return {
    add: useMutation({ mutationFn: wishlistService.addWishlistItem, onSuccess }),
    remove: useMutation({ mutationFn: wishlistService.removeWishlistItem, onSuccess }),
  }
}

export function useUpdateAccountMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: accountService.updateUserAccount,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: userKeys.account() })
    },
  })
}
