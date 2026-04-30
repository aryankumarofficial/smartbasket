export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface OrderSummary {
  id: string
  status: OrderStatus
  totalCents: number
  updatedAt: string
}

export interface OrderListResponse {
  orders: OrderSummary[]
}

export interface OrderUpdatePayload {
  orderId: string
  status: OrderStatus
  updatedAt?: string
}

export interface NotificationPayload {
  id: string
  type: "order_shipped" | "order_delivered" | string
  title: string
  body?: string
  orderId?: string
  createdAt: string
}
