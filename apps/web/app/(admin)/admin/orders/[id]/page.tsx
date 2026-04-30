"use client"

import { useParams } from "next/navigation"

import { AdminOrderDetail } from "@/src/features/admin/admin-order-detail"

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ""
  if (!id) {
    return <p className="text-muted-foreground text-sm">Missing order id.</p>
  }
  return <AdminOrderDetail orderId={id} />
}
