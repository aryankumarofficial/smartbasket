import type { Metadata } from "next"

import { PublicShell } from "@/src/components/public/PublicShell"
import { SessionTrackingBootstrap } from "@/src/components/public/SessionTrackingBootstrap"

export const metadata: Metadata = {
  title: {
    default: "SmartBasket · Storefront",
    template: "%s · SmartBasket",
  },
  description: "Browse an ML-powered storefront that learns from live behavior.",
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicShell>
      <SessionTrackingBootstrap />
      {children}
    </PublicShell>
  )
}
