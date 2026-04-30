import type { ProductListFilters } from "@/src/types/product"

export const storefrontKeys = {
  all: ["storefront"] as const,
  product: (id: string) => ["storefront", "product", id] as const,
  catalog: (filters: ProductListFilters | undefined) =>
    ["storefront", "catalog", filters ?? {}] as const,
  recommendations: (userId: string) => ["storefront", "recommendations", userId] as const,
  similar: (productId: string) => ["storefront", "similar", productId] as const,
  search: (q: string, category: string, sortBy: string, sessionId: string) =>
    ["storefront", "search", q, category, sortBy, sessionId] as const,
}
