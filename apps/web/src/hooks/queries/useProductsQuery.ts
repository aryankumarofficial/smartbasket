"use client"

import { useQuery } from "@tanstack/react-query"

import { staleTimeCatalog } from "@/src/lib/query-client"
import { productKeys } from "@/src/hooks/queries/keys"
import * as productService from "@/src/services/product.service"
import type { ProductListFilters } from "@/src/types/product"

export function useProductsQuery(filters?: ProductListFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.listProducts(filters),
    staleTime: staleTimeCatalog,
    retry: 2,
  })
}

export function useProductDetailQuery(productId: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(productId ?? ""),
    queryFn: () => productService.getProductById(productId!),
    enabled: Boolean(productId),
    staleTime: staleTimeCatalog,
    retry: 2,
  })
}

/**
 * Example write path: extend `updates` when PATCH /api/products/:id exists server-side.
 */