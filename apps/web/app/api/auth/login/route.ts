import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getUserByEmail } from "@workspace/db/queries/user"
import { REFRESH_TOKEN_COOKIE_NAME, refreshCookieAttributes } from "@/src/lib/auth/cookies"
import { signAccessToken, signRefreshToken } from "@/src/lib/auth/tokens"
import type { AuthUser } from "@/src/types/auth"

const bodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

function toAuthUser(row: {
  id: string
  email: string
  name: string
  role: string | null
}): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role === "admin" ? "admin" : "user",
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }

    const email = parsed.data.email.toLowerCase()
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const authUser = toAuthUser(user)
    const accessToken = await signAccessToken({
      sub: authUser.id,
      role: authUser.role,
      email: authUser.email,
      name: authUser.name ?? "",
    })
    const refreshToken = await signRefreshToken(user.id)

    const res = NextResponse.json({
      accessToken,
      user: authUser,
    })

    res.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshCookieAttributes())

    return res
  } catch (error) {
    console.error("POST /api/auth/login", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
