/**
 * Edge-safe auth constants for middleware (no JWT, no DB).
 * Must match the HTTP-only refresh cookie name set by your auth API.
 */
export const REFRESH_TOKEN_COOKIE_NAME =
  process.env.REFRESH_TOKEN_COOKIE_NAME ?? "refreshToken"
