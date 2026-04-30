import type { Metadata } from "next"
import { Suspense } from "react"

import { SearchView } from "@/src/features/public/SearchView"

export const metadata: Metadata = {
  title: "Search",
}

function SearchSkeleton() {
  return (
    <div className="grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((k) => (
        <div key={k} className="h-64 rounded-3xl bg-muted/80" />
      ))}
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-4xl tracking-tight">Semantic search</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          Debounced client input fans out to TanStack Query, which executes{" "}
          <code className="font-mono text-xs text-foreground/90">GET /api/search</code>{" "}
          (including ML reranking when embeddings answer). Queries and clicks both emit audited events without
          mock fixtures.
        </p>
      </header>
      <Suspense fallback={<SearchSkeleton />}>
        <SearchView />
      </Suspense>
    </div>
  )
}
