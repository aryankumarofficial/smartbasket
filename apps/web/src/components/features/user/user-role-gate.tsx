"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/src/hooks/useAuth"

export function UserRoleGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    if (user?.role === "admin" || user?.role === "super_admin") {
      router.replace("/admin/dashboard")
    }
  }, [isAuthenticated, pathname, router, user?.role])

  if (!isAuthenticated || user?.role === "admin" || user?.role === "super_admin") {
    return null
  }

  return <>{children}</>
}
