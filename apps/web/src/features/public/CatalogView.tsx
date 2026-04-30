"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { ProductCard } from "@/src/components/public/ProductCard"
import { storefrontKeys } from "@/src/features/public/query-keys"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { ingestTrackingEvents } from "@/src/services/events.service"
import { listProducts } from "@/src/services/product.service"
import type { ProductListFilters } from "@/src/types/product"

import { useTrackingIdentity } from "@/src/hooks/useTrackingIdentity"
import { staleTimeCatalog } from "@/src/lib/query-client"

export function CatalogView() {
  const identity = useTrackingIdentity()
  const queryClient = useQueryClient()
  const [draftCategory, setDraftCategory] = useState("")
  const [draftMin, setDraftMin] = useState("")
  const [draftMax, setDraftMax] = useState("")
  const [applied, setApplied] = useState<ProductListFilters>({})

  const filters: ProductListFilters = useMemo(() => applied, [applied])

  const q = useQuery({
    queryKey: storefrontKeys.catalog(filters),
    queryFn: () => listProducts(filters),
    staleTime: staleTimeCatalog,
  })

  async function applyFilters() {
    const next: ProductListFilters = {}
    if (draftCategory.trim()) {
      next.category = draftCategory.trim()
    }
    const min = Number(draftMin)
    if (draftMin !== "" && !Number.isNaN(min)) {
      next.minPrice = min
    }
    const max = Number(draftMax)
    if (draftMax !== "" && !Number.isNaN(max)) {
      next.maxPrice = max
    }

    setApplied(next)

    const fresh = await queryClient.fetchQuery({
      queryKey: storefrontKeys.catalog(next),
      queryFn: () => listProducts(next),
    })

    const resultCount = fresh.total

    if (!identity.sessionId) return
    void ingestTrackingEvents([
      {
        eventType: "search",
        sessionId: identity.sessionId,
        userId: identity.userId ?? undefined,
        anonymousId: identity.anonymousId ?? undefined,
        source: "storefront_catalog_filter",
        timestamp: new Date().toISOString(),
        metadata: {
          query: "",
          filters: next,
          resultCount,
        },
      },
    ]).catch(() => {})
  }

  return (
    <div className="space-y-8">
      <section
        aria-label="Product filters"
        className="flex flex-wrap items-end gap-4 rounded-3xl border border-border/70 bg-card/70 p-4 backdrop-blur-sm"
      >
        <div className="flex min-w-[10rem] flex-1 flex-col gap-2">
          <Label htmlFor="catalog-category">Category</Label>
          <Input
            id="catalog-category"
            placeholder="e.g. snacks"
            value={draftCategory}
            onChange={(e) => setDraftCategory(e.target.value)}
            autoComplete="off"
            className="min-h-11"
          />
        </div>
        <div className="flex min-w-[6rem] flex-col gap-2">
          <Label htmlFor="catalog-min">Min price</Label>
          <Input
            id="catalog-min"
            type="number"
            inputMode="decimal"
            min={0}
            value={draftMin}
            onChange={(e) => setDraftMin(e.target.value)}
            className="min-h-11"
          />
        </div>
        <div className="flex min-w-[6rem] flex-col gap-2">
          <Label htmlFor="catalog-max">Max price</Label>
          <Input
            id="catalog-max"
            type="number"
            inputMode="decimal"
            min={0}
            value={draftMax}
            onChange={(e) => setDraftMax(e.target.value)}
            className="min-h-11"
          />
        </div>
        <Button type="button" className="min-h-11 shrink-0" onClick={() => void applyFilters()}>
          Apply filters
        </Button>
      </section>

      {q.isPending && (
        <div className="grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-muted/80" />
          ))}
        </div>
      )}

      {q.isError && (
        <p className="text-destructive text-sm" role="alert">
          Could not load products.
        </p>
      )}

      {q.isSuccess && q.data.products.length === 0 && (
        <p className="text-muted-foreground text-sm">No matches in this aisle yet.</p>
      )}

      {q.isSuccess && q.data.products.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {q.data.products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              href={`/products/${p.id}`}
              onNavigate={() => {
                if (!identity.sessionId) return
                void ingestTrackingEvents([
                  {
                    eventType: "product_click",
                    productId: p.id,
                    sessionId: identity.sessionId,
                    userId: identity.userId,
                    anonymousId: identity.anonymousId ?? undefined,
                    source: "storefront_catalog",
                    timestamp: new Date().toISOString(),
                    metadata: { filters },
                  },
                ]).catch(() => {})
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
