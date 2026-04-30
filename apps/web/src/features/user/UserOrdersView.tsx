"use client"

import Link from "next/link"
import { useState } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

import { usePageEngagementTracking } from "@/src/hooks/usePageEngagementTracking"
import { useUserOrdersQuery } from "@/src/hooks/queries/useUserSystemQueries"
import { formatInr } from "@/src/components/public/format-price"

const STATUS = ["all", "pending", "paid", "confirmed", "shipped", "delivered", "cancelled"] as const

export function UserOrdersView() {
  const [status, setStatus] = useState<string>("all")
  const orders = useUserOrdersQuery(status === "all" ? undefined : status)
  usePageEngagementTracking("user_orders")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl tracking-tight">Orders</h1>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {(orders.data?.orders ?? []).map((order) => (
        <Card key={order.id} className="rounded-3xl border">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <div className="space-y-1">
              <p className="font-mono text-xs">{order.id}</p>
              <Badge variant="secondary">{order.status}</Badge>
            </div>
            <div className="text-sm">{formatInr(order.totalCents / 100)}</div>
            <Link className="text-primary text-sm underline-offset-4 hover:underline" href={`/orders/${order.id}`}>
              View details
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
