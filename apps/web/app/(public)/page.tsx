import Link from "next/link"

import { HomeShelf } from "@/src/features/public/HomeShelf"
import { Button } from "@workspace/ui/components/button"

export default function PublicHomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-gradient-to-br from-card/95 via-background/95 to-muted/85 px-6 py-12 shadow-sm sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-20 -bottom-28 size-[22rem] rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-24 -top-20 size-[18rem] rounded-full bg-accent/40 blur-3xl" aria-hidden />
        <div className="relative max-w-3xl space-y-5">
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.35em]">
            Live personalization
          </p>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.35rem]">
            The aisle that rewires itself for every shopper.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
            SmartBasket merges catalog truth with recommendation workers. Every glance, dwell, semantic search,
            or cart impulse becomes training signal — surfaced here via shared APIs, never hard-coded lists.
          </p>
          <div className="flex flex-wrap gap-3 pt-3">
            <Button asChild size="lg" className="min-h-11 rounded-full px-7">
              <Link href="/search">Semantic search</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-11 rounded-full px-7">
              <Link href="/products">Stable catalog view</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="reco-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="reco-heading" className="font-heading text-3xl tracking-tight">
              Picked from the graph
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
              Powered by <code className="font-mono text-xs">GET /api/recommendations</code> with hydrated product
              cards — hydrated again per SKU so thumbnails stay truthful to inventory.
            </p>
          </div>
          <Link
            href="/products"
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            View full catalog →
          </Link>
        </div>
        <HomeShelf />
      </section>
    </div>
  )
}
