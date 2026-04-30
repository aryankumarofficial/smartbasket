export interface AdminDashboardStats {
  totalUsers: number
  totalOrders: number
  revenue: number
  currency: string
  topProducts: {
    productId: string | null
    name: string
    unitsSold: number
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
