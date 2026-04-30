"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { staleTimeFast } from "@/src/lib/query-client"
import { adminKeys } from "@/src/hooks/queries/adminKeys"
import type { ProductUpsertInput } from "@/src/modules/products/types"
import * as adminProductService from "@/src/services/admin-product.service"

export type AdminProductListFilters = {
  q?: string
  category?: string
  page?: number
  limit?: number
  sort?: "name" | "price_desc" | "created_desc"
}

export function useAdminProductsQuery(filters?: AdminProductListFilters) {
  return useQuery({
    queryKey: adminKeys.productList(filters),
    queryFn: () => adminProductService.listAdminProducts(filters),
    staleTime: staleTimeFast,
  })
}

export function useAdminProductQuery(id: string | null) {
  return useQuery({
    queryKey: adminKeys.product(id ?? ""),
    queryFn: () => adminProductService.getAdminProduct(id as string),
    enabled: Boolean(id),
    staleTime: staleTimeFast,
  })
}

export function useCreateAdminProductMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      body: ProductUpsertInput
      imageFiles?: File[]
    }) => {
      const created = await adminProductService.createAdminProduct(payload.body)
      let urls: string[] = []
      if (payload.imageFiles?.length && created.product?.id) {
        const up = await adminProductService.uploadAdminProductImages(created.product.id, payload.imageFiles)
        urls = up.urls ?? []
      }
      if (urls.length && created.product?.id) {
        await adminProductService.updateAdminProduct(created.product.id, {
          images: [...(payload.body.images ?? []), ...urls],
        })
      }
      return created
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.products })
    },
  })
}

export function useUpdateAdminProductMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      id: string
      body: Partial<ProductUpsertInput>
      newImages?: File[]
    }) => {
      let extraUrls: string[] = []
      if (payload.newImages?.length) {
        const up = await adminProductService.uploadAdminProductImages(payload.id, payload.newImages)
        extraUrls = up.urls ?? []
      }
      const mergedImages =
        extraUrls.length > 0 ? [...(payload.body.images ?? []), ...extraUrls] : payload.body.images
      return adminProductService.updateAdminProduct(payload.id, {
        ...payload.body,
        ...(mergedImages !== undefined ? { images: mergedImages } : {}),
      })
    },
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: adminKeys.products })
      void qc.invalidateQueries({ queryKey: adminKeys.product(v.id) })
    },
  })
}

export function useDeleteAdminProductMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminProductService.deleteAdminProduct(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.products })
    },
  })
}
