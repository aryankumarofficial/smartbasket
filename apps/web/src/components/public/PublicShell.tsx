"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { SmartBasketMark } from "@/src/components/public/SmartBasketMark"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/search", label: "Search" },
]

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35] dark:opacity-[0.2]"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 80% at 10% -20%, oklch(0.72 0.18 145 / 0.25), transparent 50%),
            radial-gradient(ellipse 100% 60% at 90% 0%, oklch(0.65 0.12 250 / 0.2), transparent 45%),
            linear-gradient(180deg, oklch(0.99 0.01 95) 0%, oklch(0.98 0.02 95) 100%)
          `,
        }}
      />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex min-h-11 min-w-11 items-center gap-2 rounded-2xl px-1 py-1 focus-visible:ring-4 focus-visible:ring-ring/30"
          >
            <SmartBasketMark className="size-9 shrink-0" />
            <div className="hidden min-w-0 sm:block">
              <p className="font-heading text-lg leading-tight tracking-tight">SmartBasket</p>
              <p className="text-muted-foreground truncate text-xs">Curated by ML, chosen by you</p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Storefront">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Join</Link>
            </Button>
          </div>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground">
        <p>Behavior on this storefront trains SmartBasket recommendations.</p>
      </footer>
    </div>
  )
}
