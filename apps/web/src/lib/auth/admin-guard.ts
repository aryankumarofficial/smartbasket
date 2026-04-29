import { jwtVerify } from "jose"
import type { NextRequest } from "next/server"
import type { AuthContext } from "@/src/modules/auth/types"
import { requireAdmin } from "@/src/modules/auth/schema"

function getAccessTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice("bearer ".length).trim()
  }

  // Fallback for cookie-based access tokens (if your frontend uses them).
  // Refresh cookies remain HTTP-only as per your auth design.
  const cookieToken = request.cookies.get("sb_access_token")?.value
  return cookieToken ?? null
}

async function verifyAccessJwt(token: string): Promise<AuthContext> {
  const secret =
    process.env.JWT_ACCESS_SECRET ??
    (process.env.NODE_ENV !== "production" ? "devsecret" : undefined)
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured")
  }

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))

  const userId = String(payload.sub ?? "")
  const role = (payload.role as "user" | "admin" | undefined) ?? "user"

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return { userId, role }
}

export async function requireAdminRequest(
  request: NextRequest
): Promise<AuthContext> {
  const token = getAccessTokenFromRequest(request)
  if (!token) {
    throw new Error("Unauthorized")
  }

  const auth = await verifyAccessJwt(token)
  requireAdmin(auth)
  return auth
}

