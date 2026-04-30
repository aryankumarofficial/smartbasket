import { NextRequest, NextResponse } from "next/server"

import { getUserById } from "@workspace/db/queries/user"
import { REFRESH_TOKEN_COOKIE_NAME, refreshCookieAttributes } from "@/src/lib/auth/cookies"
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/src/lib/auth/tokens"
import type { AuthUser } from "@/src/types/auth"

function toAuthUser(row: {
  id: string
  email: string
  name: string
  role: string | null
}): AuthUser {
  const r = row.role
  const role: AuthUser["role"] =
    r === "super_admin" ? "super_admin" : r === "admin" ? "admin" : "user"
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role,
  }
}

export async function POST(request: NextRequest) {
  try {
    const refreshCookie = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value
    if (!refreshCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sub } = await verifyRefreshToken(refreshCookie)
    const user = await getUserById(sub)
    if (!user) {
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      res.cookies.delete(REFRESH_TOKEN_COOKIE_NAME)
      return res
    }

    const authUser = toAuthUser(user)
    const accessToken = await signAccessToken({
      sub: authUser.id,
      role: authUser.role,
      email: authUser.email,
      name: authUser.name ?? "",
    })

    const rotatedRefresh = await signRefreshToken(user.id)
    const res = NextResponse.json({
      accessToken,
      user: authUser,
    })
    res.cookies.set(REFRESH_TOKEN_COOKIE_NAME, rotatedRefresh, refreshCookieAttributes())

    return res
  } catch {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    res.cookies.delete(REFRESH_TOKEN_COOKIE_NAME)
    return res
  }
}
