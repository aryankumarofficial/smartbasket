export const adminKeys = {
  stats: ["admin", "stats"] as const,
  products: ["admin", "products"] as const,
  product: (id: string) => ["admin", "products", id] as const,
  orders: ["admin", "orders"] as const,
}
