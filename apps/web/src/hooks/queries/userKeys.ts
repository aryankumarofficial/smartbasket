export const userKeys = {
  all: ["user"] as const,
  cart: () => ["user", "cart"] as const,
  wishlist: () => ["user", "wishlist"] as const,
  account: () => ["user", "account"] as const,
  orders: (status?: string) => ["user", "orders", status ?? "all"] as const,
  orderDetail: (orderId: string) => ["user", "orders", "detail", orderId] as const,
}
