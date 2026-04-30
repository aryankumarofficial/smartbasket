import type { ProductListItem } from "@/src/types/product"
import type { OrderStatus } from "@/src/types/order"

export type CartItem = {
  id: string
  productId: string
  quantity: number
  priceAtAdd: string
  productName: string
  productImage: string | null
  productCategory: string
  inStock: boolean | null
  inventoryCount: number | null
}

export type CartResponse = { items: CartItem[] }

export type WishlistResponse = { items: ProductListItem[] }

export type AccountUser = {
  id: string
  email: string
  name: string
  role: string
}

export type AccountResponse = { user: AccountUser }

export type UserOrderDetail = {
  order: {
    id: string
    status: OrderStatus
    totalAmount: string
    currency: string
    createdAt: string
    updatedAt: string
  }
  items: Array<{
    id: string
    productId: string | null
    productName: string
    productImage: string | null
    quantity: number
    priceAtPurchase: string
  }>
}
