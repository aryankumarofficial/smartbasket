"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { getUserFacingErrorMessage } from "@/src/lib/errors"
import { useAdminAnalyticsQuery } from "@/src/hooks/queries/useAdminAnalytics"
import { Button } from "@workspace/ui/components/button"

export default function AdminAnalyticsPage() {
  const { data, isPending, isError, error, refetch } = useAdminAnalyticsQuery(false)

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-destructive text-sm">{getUserFacingErrorMessage(error)}</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const tagChart = [...data.topTags]
    .sort((a, b) => b.purchaseCount - a.purchaseCount)
    .slice(0, 8)
    .map((t) => ({
      name: t.tag.length > 14 ? `${t.tag.slice(0, 14)}…` : t.tag,
      purchases: t.purchaseCount,
      views: t.viewCount,
    }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tag performance and category demand from derived SmartBasket signals.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Tag purchases</CardTitle>
            <CardDescription>Top tags by attributed purchases (insight pipeline).</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] min-w-0">
            {tagChart.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tag insights yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagChart} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/80" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Bar dataKey="purchases" name="Purchases" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Trending categories</CardTitle>
            <CardDescription>Catalog breadth signals for buying intent.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.trendingCategories.length === 0 ? (
              <p className="text-muted-foreground text-sm">No category insights yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.trendingCategories.map((c) => (
                    <TableRow key={c.category}>
                      <TableCell className="font-medium">{c.category}</TableCell>
                      <TableCell className="text-right tabular-nums">{c.productCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Tag leaderboard</CardTitle>
          <CardDescription>Full table for operational review.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Purchases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topTags.map((t) => (
                <TableRow key={`${t.tag}-${t.category}`}>
                  <TableCell className="font-medium">{t.tag}</TableCell>
                  <TableCell className="text-muted-foreground text-xs uppercase">{t.category}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.productCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.viewCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.clickCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.purchaseCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
