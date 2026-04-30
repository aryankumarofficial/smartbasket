"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
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

const DashboardCharts = dynamic(() => import("@/src/features/admin/dashboard-charts-inner"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-[280px] rounded-2xl" />
      <Skeleton className="h-[280px] rounded-2xl" />
    </div>
  ),
})

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function AdminDashboard() {
  const defaultTo = useMemo(() => new Date(), [])
  const defaultFrom = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d
  }, [])

  const [from, setFrom] = useState(toInputDate(defaultFrom))
  const [to, setTo] = useState(toInputDate(defaultTo))

  const range = useMemo(
    () => ({
      from: new Date(`${from}T00:00:00.000Z`).toISOString(),
      to: new Date(`${to}T23:59:59.999Z`).toISOString(),
    }),
    [from, to]
  )

  const { data, isPending, isError, error, refetch } = useAdminDashboardQuery({
    from: range.from,
    to: range.to,
  })

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

  const convPct = (data.conversionRate * 100).toFixed(1)

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Operational KPIs and order economics for SmartBasket.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="dash-from" className="text-xs">
              From
            </Label>
            <Input id="dash-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dash-to" className="text-xs">
              To
            </Label>
            <Input id="dash-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
            Apply range
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
            <CardDescription>Conversion</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{convPct}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Distinct buyers ÷ registered users.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Active users (7d)</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{data.activeUsers7d}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Sessions with activity in the last week.</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts data={data} />

      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Top products</CardTitle>
          <CardDescription>By units sold across line items.</CardDescription>
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
