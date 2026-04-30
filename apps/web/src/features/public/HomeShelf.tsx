"use client"

import { useQuery } from "@tanstack/react-query"

import { ProductCard } from "@/src/components/public/ProductCard"
import { storefrontKeys } from "@/src/features/public/query-keys"
import { useTrackingIdentity } from "@/src/hooks/useTrackingIdentity"
import { staleTimeCatalog } from "@/src/lib/query-client"
import {
  fetchRecommendations,
  hydrateRecommendationsWithProducts,
} from "@/src/services/storefront-ml.service"
import { ingestTrackingEvents } from "@/src/services/events.service"

function HomeShelfSkeleton() {
  return (
    <div className="grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-72 rounded-3xl bg-muted/80" />
      ))}
    </div>
  )
}

export function HomeShelf() {
  const identity = useTrackingIdentity()

  const q = useQuery({
    queryKey: storefrontKeys.recommendations(identity.recommendationUserId),
    enabled: identity.ready,
    staleTime: staleTimeCatalog,
    queryFn: async () => {
      const reco = await fetchRecommendations({
        userId: identity.recommendationUserId,
        limit: 14,
      })
      return hydrateRecommendationsWithProducts(reco.recommendations)
    },
  })

  if (!identity.ready) {
    return <HomeShelfSkeleton />
  }

  if (q.isPending) {
    return <HomeShelfSkeleton />
  }

  if (q.isError) {
    return (
      <p className="text-muted-foreground text-sm" role="alert">
        Recommendations failed to load. Try refreshing.
      </p>
    )
  }

  const items = q.data ?? []
  const withProduct = items.filter((i) => i.product)

  if (withProduct.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nothing to recommend yet — explore the catalog to seed your taste profile.
      </p>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {withProduct.map((row) => (
        <ProductCard
          key={row.productId}
          product={row.product!}
          reason={row.reason}
          href={`/products/${row.productId}`}
          onNavigate={() => {
            if (!identity.sessionId) return
            void ingestTrackingEvents([
              {
                eventType: "product_click",
                productId: row.productId,
                sessionId: identity.sessionId,
                userId: identity.userId,
                anonymousId: identity.anonymousId ?? undefined,
                source: "home_ml_shelf",
                timestamp: new Date().toISOString(),
                metadata: { surface: "recommendations" },
              },
            ]).catch(() => {})
          }}
        />
      ))}
    </div>
  )
}
