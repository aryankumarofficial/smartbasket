"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Heart, LogOut, ShoppingCart, User, Package, Home } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useAuth } from "@/src/hooks/useAuth"

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/account", label: "Account", icon: User },
] as const

export function UserShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()

  async function handleLogout() {
    await logout()
    router.replace("/login")
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-muted/20">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/home" className="font-heading text-lg tracking-tight">
            SmartBasket
          </Link>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground hidden text-xs sm:block">{user?.email}</p>
            <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <nav className="space-y-1 rounded-3xl border bg-card p-2">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-2xl px-3 text-sm",
                    active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  )
}
