import { apiFetch, refreshAccessToken, resolveApiUrl } from "@/src/lib/api"
import { useAuthStore } from "@/src/stores/auth.store"
import type { LoginRequest, LoginResponse, RegisterRequest } from "@/src/types/auth"

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    skipAuth: true,
  })
}

export async function register(data: RegisterRequest): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  })
}

/**
 * Server clears refresh cookie; works even when access token is already stale.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(resolveApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
  } catch {
    /* Network failure — client state is still cleared by the caller. */
  }
}

/**
 * Uses the httpOnly refresh cookie to mint a new access token and hydrate Zustand.
 */
export async function refreshSession(): Promise<boolean> {
  const token = await refreshAccessToken()
  return token !== null
}

/** Clears local auth without calling the server (use sparingly). */
export function clearClientAuth(): void {
  useAuthStore.getState().clearAuth()
}
