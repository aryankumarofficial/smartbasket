"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { AdminDashboardStats } from "@/src/types/admin"

export function DashboardChartsInner({ data }: { data: AdminDashboardStats }) {
  const chartData = data.ordersSeries.map((d) => ({
    day: d.day.slice(5),
    revenue: d.revenue,
    orders: d.orderCount,
  }))

  if (chartData.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        No orders in this range yet.
      </p>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold">Revenue</h3>
        <p className="text-muted-foreground text-xs">In range (excl. cancelled)</p>
        <div className="mt-4 h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/80" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={44} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="hsl(var(--primary))"
                fill="url(#revFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold">Orders</h3>
        <p className="text-muted-foreground text-xs">Count per day</p>
        <div className="mt-4 h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="ordFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(200 80% 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(200 80% 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/80" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="hsl(200 80% 42%)"
                fill="url(#ordFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DashboardChartsInner
