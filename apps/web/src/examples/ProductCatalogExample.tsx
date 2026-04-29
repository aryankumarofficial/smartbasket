"use client"

/**
 * Reference implementation: TanStack Query for reads + actionable error UI.
 * Remove or relocate once feature screens adopt the same patterns.
 */

import { useProductsQuery } from "@/src/hooks/queries/useProductsQuery"
import { useUiStore } from "@/src/stores/ui.store"
import { ApiError } from "@/src/lib/api"
import { getUserFacingErrorMessage } from "@/src/lib/errors"

export function ProductCatalogExample() {
  const productFilters = useUiStore((s) => s.productFilters)
  const setProductFilters = useUiStore((s) => s.setProductFilters)

  const { data, error, isPending, isError, refetch, isFetching } = useProductsQuery(productFilters)

  return (
    <section className="space-y-4 p-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold">Catalog (TanStack Query example)</h2>
        <p className="text-muted-foreground text-sm">
          Filters live in Zustand (UI state). Product rows are cached server state via React Query.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Category
          <input
            className="rounded border px-2 py-1"
            value={productFilters.category ?? ""}
            placeholder="optional"
            onChange={(e) =>
              setProductFilters({
                ...productFilters,
                category: e.target.value || undefined,
              })
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Min price
          <input
            type="number"
            className="rounded border px-2 py-1"
            value={productFilters.minPrice ?? ""}
            onChange={(e) =>
              setProductFilters({
                ...productFilters,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Max price
          <input
            type="number"
            className="rounded border px-2 py-1"
            value={productFilters.maxPrice ?? ""}
            onChange={(e) =>
              setProductFilters({
                ...productFilters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </label>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : null}

      {isError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
        >
          <p className="font-medium text-destructive">Could not load products</p>
          <p className="mt-1 text-muted-foreground">{getUserFacingErrorMessage(error)}</p>
          {error instanceof ApiError ? (
            <p className="mt-1 text-xs text-muted-foreground">HTTP {error.status}</p>
          ) : null}
          <button
            type="button"
            className="mt-3 rounded bg-primary px-3 py-1 text-primary-foreground text-xs"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {data ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {data.products.length} of {data.total}
            </span>
            {isFetching ? <span>Refreshing…</span> : null}
          </div>
          <ul className="divide-y rounded-md border">
            {data.products.map((product) => (
              <li key={product.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-muted-foreground text-xs">{product.category ?? "Uncategorized"}</p>
                </div>
                <p className="font-mono text-sm">${product.price.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
