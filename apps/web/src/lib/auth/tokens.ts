import { SignJWT, jwtVerify } from "jose"
import type { UserRole } from "@/src/types/auth"

const ACCESS_TTL_S = 60 * 15
const REFRESH_TTL_S = 60 * 60 * 24 * 7

function getAccessSecret() {
  const s =
    process.env.JWT_ACCESS_SECRET ?? (process.env.NODE_ENV !== "production" ? "dev-access-secret" : undefined)
  if (!s) {
    throw new Error("JWT_ACCESS_SECRET is not configured")
  }
  return new TextEncoder().encode(s)
}

function getRefreshSecret() {
  const s =
    process.env.JWT_REFRESH_SECRET ??
    process.env.JWT_ACCESS_SECRET ??
    (process.env.NODE_ENV !== "production" ? "dev-refresh-secret" : undefined)
  if (!s) {
    throw new Error("JWT_REFRESH_SECRET or JWT_ACCESS_SECRET is not configured")
  }
  return new TextEncoder().encode(s)
}

export type AccessPayload = {
  sub: string
  role: UserRole
  email: string
  name: string
}

export async function signAccessToken(payload: AccessPayload): Promise<string> {
  return new SignJWT({
    role: payload.role,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_S}s`)
    .sign(getAccessSecret())
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ token_use: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_S}s`)
    .sign(getRefreshSecret())
}

export async function verifyAccessToken(token: string): Promise<AccessPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret())
  const sub = String(payload.sub ?? "")
  const role = (payload.role as UserRole | undefined) ?? "user"
  const email = typeof payload.email === "string" ? payload.email : ""
  const name = typeof payload.name === "string" ? payload.name : ""
  if (!sub) {
    throw new Error("Invalid token")
  }
  return { sub, role, email, name }
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, getRefreshSecret())
  if (payload.token_use !== "refresh") {
    throw new Error("Invalid refresh token")
  }
  const sub = String(payload.sub ?? "")
  if (!sub) {
    throw new Error("Invalid refresh token")
  }
  return { sub }
}
