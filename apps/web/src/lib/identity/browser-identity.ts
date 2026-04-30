const ANON_STORAGE_KEY = "sb_anonymous_id"
const SESSION_STORAGE_KEY = "sb_session_id_started"

/** Stable pseudonymous identity for recommendations + tracking (persisted). */
export function getOrCreateAnonymousId(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const existing = window.localStorage.getItem(ANON_STORAGE_KEY)
    if (existing) {
      return existing
    }
    const id = crypto.randomUUID()
    window.localStorage.setItem(ANON_STORAGE_KEY, id)
    return id
  } catch {
    return null
  }
}

/** Per-browser-tab session for analytics (sessionStorage). */
export function getOrCreateBrowserSessionId(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    let id = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

/** Recommendation API requires userId — use authenticated id or persisted anonymous UUID. */
export function resolveRecommendationUserId(
  authenticatedUserId: string | undefined,
  anonymousId: string | null
): string {
  if (authenticatedUserId) {
    return authenticatedUserId
  }
  if (!anonymousId) {
    /** Last-resort; should rarely run after mount. */
    return crypto.randomUUID()
  }
  return anonymousId
}
