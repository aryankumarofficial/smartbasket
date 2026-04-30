"use client"

import { Button } from "@workspace/ui/components/button"
import { ProductCard } from "@/src/components/public/ProductCard"
import { useTrackingIdentity } from "@/src/hooks/useTrackingIdentity"
import { usePageEngagementTracking } from "@/src/hooks/usePageEngagementTracking"
import { useCartMutations, useUserWishlistQuery, useWishlistMutations } from "@/src/hooks/queries/useUserSystemQueries"

export function UserWishlistView() {
  const identity = useTrackingIdentity()
  const wishlist = useUserWishlistQuery()
  const wishlistMut = useWishlistMutations()
  const cartMut = useCartMutations()
  usePageEngagementTracking("user_wishlist")

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl tracking-tight">Wishlist</h1>
      {wishlist.isPending && <p className="text-muted-foreground text-sm">Loading wishlist…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(wishlist.data?.items ?? []).map((product) => (
          <div key={product.id} className="space-y-2">
            <ProductCard product={product} href={`/products/${product.id}`} />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  cartMut.add.mutate({
                    productId: product.id,
                    quantity: 1,
                    sessionId: identity.sessionId ?? undefined,
                  })
                }
              >
                Move to cart
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  wishlistMut.remove.mutate({
                    productId: product.id,
                    sessionId: identity.sessionId ?? undefined,
                  })
                }
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
