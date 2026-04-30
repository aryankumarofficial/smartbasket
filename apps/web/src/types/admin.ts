export interface AdminDashboardStats {
  totalUsers: number
  totalOrders: number
  revenue: number
  currency: string
  conversionRate: number
  activeUsers7d: number
  seriesFrom: string
  seriesTo: string
  ordersSeries: { day: string; orderCount: number; revenue: number }[]
  topProducts: {
    productId: string | null
    name: string
    unitsSold: number
  }[]
}

export interface AdminOrderDetailResponse {
  order: AdminOrderRow
  items: {
    id: string
    productId: string | null
    productName: string
    productImage: string | null
    quantity: number
    priceAtPurchase: string
  }[]
}

export interface AdminOrderRow {
  id: string
  status: string
  totalAmount: string
  currency: string | null
  createdAt: Date | string
  updatedAt: Date | string
  userId: string
  userEmail: string
  userName: string
}

export interface AdminOrdersResponse {
  orders: AdminOrderRow[]
}
