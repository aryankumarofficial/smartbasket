"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { ProductCard } from "@/src/components/public/ProductCard"
import { storefrontKeys } from "@/src/features/public/query-keys"
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue"
import { useTrackingIdentity } from "@/src/hooks/useTrackingIdentity"
import { staleTimeFast } from "@/src/lib/query-client"
import { ingestTrackingEvents } from "@/src/services/events.service"
import { semanticSearch } from "@/src/services/storefront-ml.service"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price · low" },
  { value: "price_desc", label: "Price · high" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Rating" },
] as const

/** Remount whenever URLSearchParams snapshot changes — keeps input in sync without effect setState. */
export function SearchView() {
  const params = useSearchParams()
  return (
    <SearchInteractive
      key={params.toString()}
      initialQuery={params.get("q") ?? ""}
      initialCategory={params.get("category") ?? ""}
    />
  )
}

type SearchInteractiveProps = {
  initialQuery: string
  initialCategory: string
}

function SearchInteractive({ initialQuery, initialCategory }: SearchInteractiveProps) {
  const identity = useTrackingIdentity()
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<(typeof SORTS)[number]["value"]>("relevance")

  const debounced = useDebouncedValue(query.trim(), 360)
  const lastTrackedSearch = useRef<string>("")

  const q = useQuery({
    queryKey: storefrontKeys.search(
      debounced,
      category,
      sortBy,
      identity.sessionId ?? "__pending_session__"
    ),
    enabled: Boolean(identity.ready && debounced.length > 1),
    staleTime: staleTimeFast,
    queryFn: () =>
      semanticSearch({
        q: debounced,
        category: category || undefined,
        sortBy,
        limit: 24,
        userId: identity.userId ?? identity.anonymousId ?? undefined,
        sessionId: identity.sessionId ?? undefined,
      }),
  })

  /** Client-visible search instrumentation (distinct from `/api/search` server-side ingestion). */
  useEffect(() => {
    if (!identity.ready || !identity.sessionId || debounced.length < 2 || !q.isSuccess) {
      return
    }
    const dedupeKey = `${debounced}|${category}|${sortBy}|${q.dataUpdatedAt}`
    if (lastTrackedSearch.current === dedupeKey) {
      return
    }
    lastTrackedSearch.current = dedupeKey

    void ingestTrackingEvents([
      {
        eventType: "search",
        sessionId: identity.sessionId,
        userId: identity.userId,
        anonymousId: identity.anonymousId ?? undefined,
        source: "storefront_search_ui",
        timestamp: new Date().toISOString(),
        metadata: {
          query: debounced,
          filters: { category: category || null, sortBy },
          resultCount: q.data?.total ?? 0,
        },
      },
    ]).catch(() => {})
  }, [
    category,
    debounced,
    identity.anonymousId,
    identity.ready,
    identity.sessionId,
    identity.userId,
    sortBy,
    q.data?.total,
    q.dataUpdatedAt,
    q.isSuccess,
  ])

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-3xl border border-border/70 bg-card/75 p-4 backdrop-blur-sm sm:grid-cols-[minmax(0,1fr)_10rem_auto]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="semantic-search">Semantic search</Label>
          <Input
            id="semantic-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you're shopping for..."
            autoComplete="off"
            className="min-h-11"
          />
          <p className="text-muted-foreground text-xs">
            Queries sync to TanStack Query, hit `/api/search` (embedding rerank path when available).
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="search-category">Category</Label>
          <Input
            id="search-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Optional"
            className="min-h-11"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Sort</Label>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as (typeof SORTS)[number]["value"])}>
            <SelectTrigger className="min-h-11 w-full">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-border bg-popover backdrop-blur-xl">
              {SORTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!identity.ready && (
        <p className="text-muted-foreground text-sm">Initializing session for tracking…</p>
      )}

      {debounced.length < 2 && identity.ready && (
        <p className="text-muted-foreground text-sm">Type two or more letters to activate search.</p>
      )}

      {q.isPending && debounced.length > 1 && (
        <div className="grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-muted/80" />
          ))}
        </div>
      )}

      {q.isError && (
        <p className="text-destructive text-sm" role="alert">
          Search unavailable right now — please retry shortly.
        </p>
      )}

      {q.isSuccess && q.data.products.length === 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">Nothing matched.</p>
          <Link href="/products" className="text-primary text-sm underline-offset-4 hover:underline">
            Browse curated catalog aisles
          </Link>
        </div>
      )}

      {q.isSuccess && q.data.products.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {q.data.products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              href={`/products/${p.id}`}
              onNavigate={() => {
                if (!identity.sessionId || !debounced) return
                void ingestTrackingEvents([
                  {
                    eventType: "search_click",
                    sessionId: identity.sessionId,
                    userId: identity.userId,
                    anonymousId: identity.anonymousId ?? undefined,
                    source: "storefront_search",
                    timestamp: new Date().toISOString(),
                    metadata: {
                      query: debounced,
                      filters: { category: category || null, sortBy },
                      selectedProductId: p.id,
                      resultCount: q.data.total,
                    },
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
