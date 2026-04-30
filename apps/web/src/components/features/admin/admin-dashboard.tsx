"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
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
import { useAdminDashboardQuery } from "@/src/hooks/queries/useAdminDashboard"

export function AdminDashboard() {
  const { data, isPending, isError, error } = useAdminDashboardQuery()

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {getUserFacingErrorMessage(error)}
      </p>
    )
  }

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: data.currency }).format(n)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Overview of your storefront.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total users</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{data.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total orders</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{data.totalOrders}</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Revenue</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{fmtMoney(data.revenue)}</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Top SKU rows</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{data.topProducts.length}</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>
      </div>

      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Top products</CardTitle>
          <CardDescription>By units sold across fulfilled line items.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No order data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.map((row) => (
                  <TableRow key={row.productId ?? row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.unitsSold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
