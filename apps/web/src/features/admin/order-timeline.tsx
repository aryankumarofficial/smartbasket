"use client"

import { Check } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

const STEPS = [
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  paid: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
}

export function AdminOrderTimeline({ status }: { status: string }) {
  const idx = STATUS_ORDER[status] ?? 0
  const cancelled = status === "cancelled"

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight">Order timeline</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Fulfillment states: pending → confirmed (paid) → shipped → delivered.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STEPS.map((step, i) => {
          const reached = !cancelled && i <= idx
          const current = !cancelled && i === idx
          return (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-muted text-muted-foreground",
                )}
              >
                {reached ? <Check className="size-4" aria-hidden /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  current ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 ? (
                <span className="text-muted-foreground px-1 text-xs" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
      {cancelled ? (
        <p className="text-destructive mt-4 text-sm font-medium" role="status">
          This order was cancelled.
        </p>
      ) : null}
    </div>
  )
}
