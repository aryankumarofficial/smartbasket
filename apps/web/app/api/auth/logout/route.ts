import { NextResponse } from "next/server"

import { REFRESH_TOKEN_COOKIE_NAME } from "@/src/lib/auth/cookies"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(REFRESH_TOKEN_COOKIE_NAME)
  return res
}
