"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { useAuth } from "@/src/hooks/useAuth"

export function AdminRoleGate({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      router.replace("/")
    }
  }, [isAuthenticated, router, user])

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-dvh flex-col gap-4 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full max-w-3xl" />
      </div>
    )
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return null
  }

  return children
}
