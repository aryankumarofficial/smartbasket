"use client"

import type { ComponentProps } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { getUserFacingErrorMessage } from "@/src/lib/errors"
import { useAdminOrdersQuery, useUpdateOrderStatusMutation } from "@/src/hooks/queries/useAdminOrders"
import type { AdminOrderRow } from "@/src/types/admin"

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const

function statusBadgeVariant(status: string): ComponentProps<typeof Badge>["variant"] {
  switch (status) {
    case "delivered":
      return "default"
    case "shipped":
      return "secondary"
    case "paid":
      return "outline"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

export function AdminOrdersPanel() {
  const { data, isPending, isError, error, refetch } = useAdminOrdersQuery()
  const updateStatus = useUpdateOrderStatusMutation()

  const orders = data?.orders ?? []

  if (isPending) {
    return <p className="text-muted-foreground text-sm">Loading orders…</p>
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <p className="text-destructive text-sm">{getUserFacingErrorMessage(error)}</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm">Fulfillment queue and status controls.</p>
      </div>

      {orders.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-2xl border border-dashed p-10 text-center text-sm">
          No orders yet.
        </p>
      ) : (
        <div className="border-border rounded-2xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[200px]">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((row: AdminOrderRow) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.id.slice(0, 8)}…</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{row.userName}</span>
                      <span className="text-muted-foreground text-xs">{row.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.totalAmount} {row.currency ?? ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(row.status)} className="uppercase">
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.status}
                      disabled={updateStatus.isPending}
                      onValueChange={(value) => {
                        void updateStatus.mutateAsync({ id: row.id, status: value })
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
