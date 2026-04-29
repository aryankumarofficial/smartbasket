import { apiFetch } from "@/src/lib/api"
import type { ProductDetailResponse, ProductListFilters, ProductListResponse } from "@/src/types/product"

function buildQuery(filters?: ProductListFilters): string {
  if (!filters) {
    return ""
  }
  const params = new URLSearchParams()
  if (filters.category) {
    params.set("category", filters.category)
  }
  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice))
  }
  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export async function listProducts(filters?: ProductListFilters): Promise<ProductListResponse> {
  return apiFetch<ProductListResponse>(`/api/products${buildQuery(filters)}`)
}

export async function getProductById(id: string): Promise<ProductDetailResponse> {
  return apiFetch<ProductDetailResponse>(`/api/products/${encodeURIComponent(id)}`)
}
