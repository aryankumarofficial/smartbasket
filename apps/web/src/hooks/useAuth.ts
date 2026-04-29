"use client"

import { useCallback, useMemo } from "react"

import { useAuthStore } from "@/src/stores/auth.store"
import * as authService from "@/src/services/auth.service"
import type { AuthUser, LoginRequest } from "@/src/types/auth"

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const isAuthenticated = Boolean(accessToken && user)

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const session = await authService.login(credentials)
      setAuth({
        accessToken: session.accessToken,
        user: session.user,
      })
      return session
    },
    [setAuth],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  /** Restores session from refresh cookie (also invoked globally via AuthBootstrap). */
  const bootstrapAuth = useCallback(async () => {
    await authService.refreshSession()
  }, [])

  const applySession = useCallback(
    (payload: { accessToken: string; user: AuthUser }) => {
      setAuth(payload)
    },
    [setAuth],
  )

  return useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated,
      login,
      logout,
      bootstrapAuth,
      applySession,
      clearAuth,
    }),
    [
      accessToken,
      user,
      isAuthenticated,
      login,
      logout,
      bootstrapAuth,
      applySession,
      clearAuth,
    ],
  )
}
