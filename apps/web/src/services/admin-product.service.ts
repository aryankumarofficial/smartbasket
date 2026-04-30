import { apiFetch, resolveApiUrl } from "@/src/lib/api"
import { useAuthStore } from "@/src/stores/auth.store"
import type { ProductUpsertInput } from "@/src/modules/products/types"
import type { ProductDetailResponse, ProductListResponse } from "@/src/types/product"

export async function listAdminProducts(params?: { category?: string; minPrice?: number; maxPrice?: number }) {
  const sp = new URLSearchParams()
  if (params?.category) {
    sp.set("category", params.category)
  }
  if (params?.minPrice !== undefined) {
    sp.set("minPrice", String(params.minPrice))
  }
  if (params?.maxPrice !== undefined) {
    sp.set("maxPrice", String(params.maxPrice))
  }
  const q = sp.toString()
  return apiFetch<ProductListResponse>(`/api/admin/products${q ? `?${q}` : ""}`)
}

export async function getAdminProduct(id: string) {
  return apiFetch<ProductDetailResponse>(`/api/admin/products/${encodeURIComponent(id)}`)
}

export async function createAdminProduct(body: ProductUpsertInput) {
  return apiFetch<ProductDetailResponse>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updateAdminProduct(id: string, body: Partial<ProductUpsertInput>) {
  return apiFetch<ProductDetailResponse>(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function deleteAdminProduct(id: string) {
  return apiFetch<{ ok: boolean; id: string }>(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export async function uploadAdminProductImages(productId: string, files: File[]) {
  const form = new FormData()
  for (const f of files) {
    form.append("files", f)
  }
  const token = useAuthStore.getState().accessToken
  const url = resolveApiUrl(`/api/admin/uploads/products/${encodeURIComponent(productId)}`)
  const res = await fetch(url, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data
        ? String((data as { error: string }).error)
        : "Upload failed",
    )
  }
  return data as { urls: string[] }
}
