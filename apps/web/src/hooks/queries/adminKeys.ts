export const adminKeys = {
  all: ["admin"] as const,
  stats: (range?: { from?: string; to?: string }) =>
    ["admin", "stats", range?.from ?? "", range?.to ?? ""] as const,
  analytics: ["admin", "analytics"] as const,
  products: ["admin", "products"] as const,
  productList: (filters?: Record<string, string | number | undefined>) =>
    [...adminKeys.products, "list", filters ?? {}] as const,
  product: (id: string) => [...adminKeys.products, id] as const,
  orders: ["admin", "orders"] as const,
  orderList: (filters?: Record<string, string | number | undefined>) =>
    [...adminKeys.orders, "list", filters ?? {}] as const,
  order: (id: string) => [...adminKeys.orders, "detail", id] as const,
}
