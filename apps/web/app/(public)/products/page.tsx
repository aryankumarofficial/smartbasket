import type { Metadata } from "next"

import { CatalogView } from "@/src/features/public/CatalogView"

export const metadata: Metadata = {
  title: "Shop",
}

export default function ProductsListingPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-4xl tracking-tight">Stable catalog crawl</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          Direct read model from{" "}
          <code className="font-mono text-xs text-foreground/90">GET /api/products</code>. Apply filters —
          telemetry logs filter intent through <code className="font-mono text-xs text-foreground/90">
            POST /api/events
          </code>{" "}
          so planners know which aisles explorers care about.
        </p>
      </header>
      <CatalogView />
    </div>
  )
}
