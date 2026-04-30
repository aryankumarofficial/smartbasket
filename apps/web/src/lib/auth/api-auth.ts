import type { NextRequest } from "next/server"

import type { AccessPayload } from "@/src/lib/auth/tokens"
import { verifyAccessToken } from "@/src/lib/auth/tokens"

export async function getAccessUser(
  request: NextRequest
): Promise<AccessPayload | null> {
  const header = request.headers.get("authorization")
  if (!header?.startsWith("Bearer ")) return null
  const token = header.slice(7).trim()
  if (!token) return null
  try {
    return await verifyAccessToken(token)
  } catch {
    return null
  }
}

export async function requireAccessUser(request: NextRequest): Promise<AccessPayload> {
  const user = await getAccessUser(request)
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
