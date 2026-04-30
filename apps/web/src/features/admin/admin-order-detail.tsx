"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { getUserFacingErrorMessage } from "@/src/lib/errors"
import { useAdminOrderQuery, useUpdateOrderStatusMutation } from "@/src/hooks/queries/useAdminOrders"
import { AdminOrderTimeline } from "@/src/features/admin/order-timeline"

const ALL = ["pending", "paid", "shipped", "delivered", "cancelled"] as const

function allowedNext(current: string): readonly string[] {
  switch (current) {
    case "pending":
      return ["paid", "cancelled"]
    case "paid":
      return ["shipped", "cancelled"]
    case "shipped":
      return ["delivered", "cancelled"]
    case "delivered":
      return []
    case "cancelled":
      return []
    default:
      return [...ALL]
  }
}

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const { data, isPending, isError, error, refetch } = useAdminOrderQuery(orderId)
  const updateMut = useUpdateOrderStatusMutation()
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null)

  const order = data?.order
  const items = data?.items ?? []

  const nextOptions = useMemo(() => (order ? allowedNext(order.status) : []), [order])

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="space-y-2">
        <p className="text-destructive text-sm">{getUserFacingErrorMessage(error)}</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const subtotal = items.reduce(
    (acc, li) => acc + Number(li.priceAtPurchase) * li.quantity,
    0,
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order detail</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">{order.id}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/orders">Back to orders</Link>
        </Button>
      </div>

      <AdminOrderTimeline status={order.status} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Customer</CardTitle>
            <CardDescription>Account linked to this order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Name: </span>
              {order.userName}
            </p>
            <p>
              <span className="text-muted-foreground">Email: </span>
              {order.userEmail}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
            <CardDescription>Fulfillment address is not stored on the order yet.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Use your ops workflow for carrier labels. Contact the customer at{" "}
            <span className="text-foreground font-medium">{order.userEmail}</span> if details are
            required.
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Status control</CardTitle>
            <CardDescription>Valid transitions are enforced for operational safety.</CardDescription>
          </div>
          {nextOptions.length > 0 ? (
            <div className="flex flex-wrap items-end gap-2">
              <Select
                onValueChange={(v) => setConfirmStatus(v)}
                disabled={updateMut.isPending}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Change status…" />
                </SelectTrigger>
                <SelectContent>
                  {nextOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No further transitions from this state.</p>
          )}
        </CardHeader>
      </Card>

      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Line items</CardTitle>
          <CardDescription>Snapshot captured at checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16" />
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit</TableHead>
                <TableHead className="text-right">Line</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((li) => (
                <TableRow key={li.id}>
                  <TableCell>
                    {li.productImage ? (
                      <Image
                        src={li.productImage}
                        alt=""
                        width={48}
                        height={48}
                        className="rounded-md object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="bg-muted size-12 rounded-md" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{li.productName}</TableCell>
                  <TableCell className="text-right tabular-nums">{li.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">{li.priceAtPurchase}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {(Number(li.priceAtPurchase) * li.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end border-t pt-4 text-sm">
            <div className="space-y-1 text-right">
              <p>
                <span className="text-muted-foreground">Subtotal </span>
                <span className="tabular-nums font-semibold">{subtotal.toFixed(2)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Total ({order.currency ?? "INR"}) </span>
                <span className="tabular-nums text-lg font-bold">{order.totalAmount}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(confirmStatus)} onOpenChange={() => setConfirmStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update order status?</AlertDialogTitle>
            <AlertDialogDescription>
              Set order to <strong>{confirmStatus}</strong>. Customers may receive automated emails
              when marked shipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmStatus) return
                void updateMut
                  .mutateAsync({ id: order.id, status: confirmStatus })
                  .then(() => setConfirmStatus(null))
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
