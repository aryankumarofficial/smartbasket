"use client"

import { useEffect } from "react"

import { refreshSession } from "@/src/services/auth.service"

let sessionHydrationRequested = false

/**
 * Runs once on mount to rotate/restores access token from the httpOnly refresh cookie.
 */
export function AuthBootstrap() {
  useEffect(() => {
    if (sessionHydrationRequested) {
      return
    }
    sessionHydrationRequested = true
    void refreshSession()
  }, [])

  return null
}
