import { REFRESH_TOKEN_COOKIE_NAME } from "@/src/config/auth-edge"

/** Seven days, matches refresh JWT TTL. */
export const REFRESH_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 7

export function refreshCookieAttributes() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE_S,
  }
}

export { REFRESH_TOKEN_COOKIE_NAME }
