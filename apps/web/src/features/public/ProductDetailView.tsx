"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ProductCard } from "@/src/components/public/ProductCard"
import { formatInr } from "@/src/components/public/format-price"
import { storefrontKeys } from "@/src/features/public/query-keys"
import { useTrackingIdentity } from "@/src/hooks/useTrackingIdentity"
import { useProductViewTracking } from "@/src/hooks/useProductViewTracking"
import { staleTimeCatalog } from "@/src/lib/query-client"
import { getProductById } from "@/src/services/product.service"
import {
  fetchSimilarProducts,
  hydrateRecommendationsWithProducts,
} from "@/src/services/storefront-ml.service"
import { ingestTrackingEvents } from "@/src/services/events.service"
import { Button } from "@workspace/ui/components/button"
import type { ProductListItem } from "@/src/types/product"

export function ProductDetailView({ productId }: { productId: string }) {
  const identity = useTrackingIdentity()
  const queryClient = useQueryClient()

  useProductViewTracking(identity, productId, { source: "storefront_pdp" })

  const detail = useQuery({
    queryKey: storefrontKeys.product(productId),
    queryFn: async () => (await getProductById(productId)).product,
  })

  const similar = useQuery({
    queryKey: storefrontKeys.similar(productId),
    enabled: Boolean(productId && identity.ready),
    staleTime: staleTimeCatalog,
    queryFn: async () => {
      const reco = await fetchSimilarProducts(productId, 10)
      return hydrateRecommendationsWithProducts(reco.recommendations.filter((r) => r.productId !== productId))
    },
  })

  const wishMutation = useMutation({
    mutationFn: async () => {
      await ingestTrackingEvents([
        {
          eventType: "wishlist_add",
          productId,
          sessionId: identity.sessionId!,
          userId: identity.userId!,
          anonymousId: identity.anonymousId ?? undefined,
          source: "storefront_pdp",
          timestamp: new Date().toISOString(),
          metadata: { surface: "pdp_primary" },
        },
      ])
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storefrontKeys.similar(productId) }),
  })

  const cartMutation = useMutation({
    mutationFn: async () => {
      await ingestTrackingEvents([
        {
          eventType: "cart_add",
          productId,
          sessionId: identity.sessionId!,
          userId: identity.userId!,
          anonymousId: identity.anonymousId ?? undefined,
          source: "storefront_pdp",
          timestamp: new Date().toISOString(),
          metadata: { quantity: 1, surface: "pdp_primary" },
        },
      ])
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: storefrontKeys.recommendations(identity.recommendationUserId),
      }),
  })

  const authBlocked = useMemo(() => !identity.userId, [identity.userId])

  if (detail.isPending) {
    return <DetailSkeleton />
  }

  const product = detail.data as (ProductListItem & { metadata?: Record<string, unknown> | null }) | undefined

  if (detail.isError || !product) {
    return (
      <div className="space-y-4">
        <p className="text-destructive" role="alert">
          Product not found.
        </p>
        <Button variant="outline" asChild>
          <Link href="/products">Browse catalog</Link>
        </Button>
      </div>
    )
  }

  const heroSrc = product.imageUrl ?? product.images?.[0] ?? null
  const title = product.title ?? product.name ?? "Product"

  const similarTiles = similar.data ?? []
  const withProduct = similarTiles.filter((row) => row.product)

  return (
    <div className="space-y-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-muted lg:aspect-[5/6]">
          {heroSrc ? (
            <Image
              src={heroSrc}
              alt={title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="flex size-full items-center justify-center font-mono text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
              {product.category}
            </p>
            <h1 className="font-heading mt-2 text-4xl tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 text-3xl font-medium tabular-nums">{formatInr(product.price)}</p>
          </div>
          {product.description && (
            <p className="text-muted-foreground max-w-xl text-base leading-relaxed">{product.description}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="min-h-11 px-8"
              disabled={authBlocked || cartMutation.isPending || !identity.sessionId}
              onClick={() => {
                if (!identity.userId || !identity.sessionId) return
                cartMutation.mutate()
              }}
            >
              {authBlocked ? "Sign in to add to cart" : cartMutation.isPending ? "Recording…" : "Add to cart"}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="min-h-11 px-8"
              disabled={authBlocked || wishMutation.isPending || !identity.sessionId}
              onClick={() => {
                if (!identity.userId || !identity.sessionId) return
                wishMutation.mutate()
              }}
            >
              {authBlocked ? "Sign in for wishlist" : wishMutation.isPending ? "Saving…" : "Wishlist"}
            </Button>
            {!authBlocked ? null : (
              <Button size="lg" variant="outline" asChild className="min-h-11">
                <Link href={`/login?next=/products/${productId}`}>Go to sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <section aria-labelledby="similar-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 id="similar-heading" className="font-heading text-2xl tracking-tight">
            Similar picks
          </h2>
          <p className="text-muted-foreground max-w-sm text-xs">
            Served from the ML similarity service — not hand-picked placeholders.
          </p>
        </div>
        {similar.isPending && (
          <div className="grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((k) => (
              <div key={k} className="h-64 rounded-3xl bg-muted/80" />
            ))}
          </div>
        )}
        {similar.isError && (
          <p className="text-muted-foreground text-sm">Could not load similar products.</p>
        )}
        {similar.isSuccess && withProduct.length === 0 && (
          <p className="text-muted-foreground text-sm">No adjacent items surfaced yet.</p>
        )}
        {similar.isSuccess && withProduct.length > 0 && (
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
                      source: "pdp_similar_ml",
                      timestamp: new Date().toISOString(),
                      metadata: { anchorProductId: productId },
                    },
                  ]).catch(() => {})
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="aspect-square rounded-[2rem] bg-muted lg:aspect-[5/6]" />
      <div className="space-y-4">
        <div className="h-10 w-2/3 rounded-full bg-muted" />
        <div className="h-6 w-1/4 rounded-full bg-muted" />
        <div className="h-24 w-full rounded-3xl bg-muted" />
        <div className="flex gap-3">
          <div className="h-11 w-40 rounded-full bg-muted" />
          <div className="h-11 w-40 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  )
}
