"use client"

import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { formatInr } from "@/src/components/public/format-price"
import { ProductCard } from "@/src/components/public/ProductCard"
import { useTrackingIdentity } from "@/src/hooks/useTrackingIdentity"
import { usePageEngagementTracking } from "@/src/hooks/usePageEngagementTracking"
import { useCartMutations, useUserCartQuery } from "@/src/hooks/queries/useUserSystemQueries"
import { fetchRecommendations, hydrateRecommendationsWithProducts } from "@/src/services/storefront-ml.service"
import { placeOrder } from "@/src/services/order.service"
import { ingestTrackingEvents } from "@/src/services/events.service"
import { useQuery } from "@tanstack/react-query"

export function UserCartView() {
  const identity = useTrackingIdentity()
  const queryClient = useQueryClient()
  const { data, isPending } = useUserCartQuery()
  const cartMutations = useCartMutations()
  usePageEngagementTracking("user_cart")

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const items = (data?.items ?? []).map((item) => ({ productId: item.productId, quantity: item.quantity }))
      if (items.length === 0) throw new Error("Cart is empty")
      await ingestTrackingEvents([
        {
          eventType: "checkout_started",
          sessionId: identity.sessionId ?? undefined,
          userId: identity.userId ?? undefined,
          anonymousId: identity.anonymousId ?? undefined,
          source: "user_cart",
          timestamp: new Date().toISOString(),
          metadata: { itemCount: items.length },
        },
      ])
      const result = await placeOrder({ items })
      await ingestTrackingEvents([
        {
          eventType: "order_placed",
          sessionId: identity.sessionId ?? undefined,
          userId: identity.userId ?? undefined,
          anonymousId: identity.anonymousId ?? undefined,
          source: "user_cart",
          timestamp: new Date().toISOString(),
          metadata: { orderId: result.orderId, itemCount: items.length },
        },
      ])
      return result
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", "cart"] })
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      await queryClient.invalidateQueries({ queryKey: ["user", "orders"] })
    },
  })

  const total = useMemo(
    () => (data?.items ?? []).reduce((sum, i) => sum + Number(i.priceAtAdd) * i.quantity, 0),
    [data?.items]
  )

  const suggestions = useQuery({
    queryKey: ["user", "cart", "recommendations", identity.userId ?? "anon"],
    enabled: Boolean(identity.userId),
    queryFn: async () => {
      const base = await fetchRecommendations({ userId: identity.userId!, limit: 6 })
      return hydrateRecommendationsWithProducts(base.recommendations)
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl tracking-tight">Cart</h1>
      {isPending && <p className="text-muted-foreground text-sm">Loading cart…</p>}
      {(data?.items ?? []).map((item) => (
        <Card key={item.id} className="rounded-3xl border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{item.productName}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">{formatInr(item.priceAtAdd)}</p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  cartMutations.update.mutate({
                    productId: item.productId,
                    quantity: Math.max(1, item.quantity - 1),
                    sessionId: identity.sessionId ?? undefined,
                  })
                }
              >
                -
              </Button>
              <span className="min-w-8 text-center text-sm">{item.quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  cartMutations.update.mutate({
                    productId: item.productId,
                    quantity: item.quantity + 1,
                    sessionId: identity.sessionId ?? undefined,
                  })
                }
              >
                +
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  cartMutations.remove.mutate({
                    productId: item.productId,
                    sessionId: identity.sessionId ?? undefined,
                  })
                }
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="rounded-3xl border">
        <CardContent className="flex items-center justify-between pt-6">
          <p className="text-lg font-medium">Total: {formatInr(total)}</p>
          <Button disabled={checkoutMutation.isPending || (data?.items.length ?? 0) === 0} onClick={() => checkoutMutation.mutate()}>
            {checkoutMutation.isPending ? "Placing order…" : "Checkout"}
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-heading text-2xl">Suggested for cart</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(suggestions.data ?? [])
            .filter((r) => r.product)
            .map((r) => (
              <ProductCard key={r.productId} product={r.product!} href={`/products/${r.productId}`} reason={r.reason} />
            ))}
        </div>
      </section>
    </div>
  )
}
