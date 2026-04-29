import { clientConfig } from "@/src/config/client"
import { useAuthStore } from "@/src/stores/auth.store"
import type { AuthUser } from "@/src/types/auth"
import type { NormalizedApiError } from "@/src/types/api"

export class ApiError extends Error implements NormalizedApiError {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }

  toJSON(): NormalizedApiError {
    return {
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
    }
  }
}

export type ApiFetchOptions = Omit<RequestInit, "credentials"> & {
  skipAuth?: boolean
  /** Internal: prevents infinite 401 refresh loops. */
  _retriedAfterRefresh?: boolean
}

export function resolveApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  const p = path.startsWith("/") ? path : `/${path}`
  const base = clientConfig.apiBaseUrl
  return base ? `${base}${p}` : p
}

function extractMessage(data: unknown, fallback: string): string {
  if (typeof data !== "object" || data === null) {
    return fallback
  }
  const record = data as Record<string, unknown>
  if (typeof record.message === "string") {
    return record.message
  }
  if (typeof record.error === "string") {
    return record.error
  }
  return fallback
}

function extractCode(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) {
    return undefined
  }
  const record = data as Record<string, unknown>
  return typeof record.code === "string" ? record.code : undefined
}

let refreshMutex: Promise<string | null> | null = null

/**
 * Single-flight refresh: parallel 401s share one refresh call.
 * Returns new access token or null when refresh fails.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshMutex) {
    refreshMutex = (async (): Promise<string | null> => {
      try {
        const res = await fetch(resolveApiUrl("/api/auth/refresh"), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })

        const rawText = await res.text()
        let body: unknown
        try {
          body = rawText ? JSON.parse(rawText) : undefined
        } catch {
          body = undefined
        }

        const token =
          typeof body === "object" &&
          body !== null &&
          "accessToken" in body &&
          typeof (body as { accessToken: unknown }).accessToken === "string"
            ? (body as { accessToken: string }).accessToken
            : null

        const bodyUser =
          typeof body === "object" &&
          body !== null &&
          "user" in body &&
          typeof (body as { user: unknown }).user === "object" &&
          (body as { user: unknown }).user !== null
            ? ((body as { user: AuthUser }).user as AuthUser)
            : null

        const mergedUser = bodyUser ?? useAuthStore.getState().user

        if (!res.ok || !token || !mergedUser?.id) {
          useAuthStore.getState().clearAuth()
          return null
        }

        useAuthStore.getState().setAuth({
          accessToken: token,
          user: mergedUser,
        })

        return token
      } catch {
        useAuthStore.getState().clearAuth()
        return null
      } finally {
        refreshMutex = null
      }
    })()
  }

  return refreshMutex
}

function buildHeaders(init: RequestInit, accessToken: string | null, skipAuth: boolean): Headers {
  const headers = new Headers(init.headers)
  if (!skipAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }
  const body = init.body
  const isForm = typeof FormData !== "undefined" && body instanceof FormData
  if (!isForm && body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  return headers
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth = false, _retriedAfterRefresh = false, ...init } = options
  const url = resolveApiUrl(path)

  const token = skipAuth ? null : useAuthStore.getState().accessToken
  const headers = buildHeaders(init, token, skipAuth)

  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers,
  })

  if (res.status === 401 && !skipAuth && !_retriedAfterRefresh) {
    const nextToken = await refreshAccessToken()
    if (nextToken) {
      return apiFetch<T>(path, {
        ...options,
        _retriedAfterRefresh: true,
      })
    }
  }

  const rawText = await res.text()
  let data: unknown
  try {
    data = rawText ? JSON.parse(rawText) : undefined
  } catch {
    data = rawText || undefined
  }

  if (!res.ok) {
    const message = extractMessage(data, res.statusText || "Request failed")
    throw new ApiError(message, res.status, extractCode(data), data)
  }

  return data as T
}
