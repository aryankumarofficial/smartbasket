import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createUser, getUserByEmail } from "@workspace/db/queries/user"

const bodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
})

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: "Validation failed", fields: msg },
        { status: 400 },
      )
    }

    const { name, email, password } = parsed.data
    const existing = await getUserByEmail(email.toLowerCase())
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await createUser({
      email: email.toLowerCase(),
      name,
      passwordHash,
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/auth/register", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
