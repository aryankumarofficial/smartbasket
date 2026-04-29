import { QueryClient } from "@tanstack/react-query"

/**
 * Server state defaults: short staleness, bounded retries, no focus refetch spam.
 */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  })
}

/** Frequently changing lists (orders, cart-like views). */
export const staleTimeFast = 30_000

/** Catalog-style reads that can tolerate slightly older data. */
export const staleTimeCatalog = 120_000
