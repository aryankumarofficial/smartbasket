"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"

import { formatInr } from "@/src/components/public/format-price"
import { useSocket } from "@/src/hooks/useSocket"
import { userKeys } from "@/src/hooks/queries/userKeys"
import { useUserOrderDetailQuery } from "@/src/hooks/queries/useUserSystemQueries"
import { usePageEngagementTracking } from "@/src/hooks/usePageEngagementTracking"

export function UserOrderDetailView({ orderId }: { orderId: string }) {
  const detail = useUserOrderDetailQuery(orderId)
  const socket = useSocket()
  const qc = useQueryClient()
  usePageEngagementTracking(`user_order_detail_${orderId}`)

  useEffect(() => {
    if (!socket.socket) return
    const onUpdate = (payload: { orderId?: string }) => {
      if (payload?.orderId && payload.orderId !== orderId) return
      void qc.invalidateQueries({ queryKey: userKeys.orderDetail(orderId) })
      void qc.invalidateQueries({ queryKey: userKeys.orders() })
    }
    socket.socket.on("order:update", onUpdate)
    return () => {
      socket.socket?.off("order:update", onUpdate)
    }
  }, [orderId, qc, socket.socket])

  if (detail.isPending) return <p className="text-muted-foreground text-sm">Loading order…</p>
  if (!detail.data) return <p className="text-destructive text-sm">Order not found.</p>

  const { order, items } = detail.data

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border">
        <CardHeader>
          <CardTitle>Order timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-mono text-xs">{order.id}</p>
          <p>Status: {order.status}</p>
          <p>Total: {formatInr(order.totalAmount)}</p>
        </CardContent>
      </Card>
      <Card className="rounded-3xl border">
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatInr(item.priceAtPurchase)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
