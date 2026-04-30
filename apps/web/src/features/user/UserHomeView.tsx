"use client"

import { useQuery } from "@tanstack/react-query"

import { ProductCard } from "@/src/components/public/ProductCard"
import { useTrackingIdentity } from "@/src/hooks/useTrackingIdentity"
import { usePageEngagementTracking } from "@/src/hooks/usePageEngagementTracking"
import { fetchRecommendations, hydrateRecommendationsWithProducts } from "@/src/services/storefront-ml.service"
import { ingestTrackingEvents } from "@/src/services/events.service"

export function UserHomeView() {
  const identity = useTrackingIdentity()
  usePageEngagementTracking("user_home")

  const recos = useQuery({
    queryKey: ["user", "home", "recommendations", identity.userId ?? "anon"],
    enabled: Boolean(identity.userId),
    queryFn: async () => {
      const data = await fetchRecommendations({ userId: identity.userId!, limit: 12 })
      return hydrateRecommendationsWithProducts(data.recommendations)
    },
  })

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Personalized recommendations from live behavior and ML ranking.
        </p>
      </div>
      {recos.isPending && <p className="text-muted-foreground text-sm">Loading recommendations…</p>}
      {recos.isSuccess && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recos.data
            .filter((r) => r.product)
            .map((r) => (
              <ProductCard
                key={r.productId}
                product={r.product!}
                reason={r.reason}
                href={`/products/${r.productId}`}
                onNavigate={() => {
                  if (!identity.sessionId) return
                  void ingestTrackingEvents([
                    {
                      eventType: "product_click",
                      productId: r.productId,
                      sessionId: identity.sessionId,
                      userId: identity.userId ?? undefined,
                      anonymousId: identity.anonymousId ?? undefined,
                      source: "user_home_reco",
                      timestamp: new Date().toISOString(),
                      metadata: { reason: r.reason },
                    },
                  ]).catch(() => {})
                }}
              />
            ))}
        </div>
      )}
    </section>
  )
}
