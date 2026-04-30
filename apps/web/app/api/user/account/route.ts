import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { db, users } from "@workspace/db"
import { getUserById } from "@workspace/db/queries/index"
import { requireAccessUser } from "@/src/lib/auth/api-auth"

const updateSchema = z.object({
  name: z.string().min(1).max(80),
})

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAccessUser(request)
    const user = await getUserById(authUser.sub)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load account"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await requireAccessUser(request)
    const body = updateSchema.parse(await request.json())

    const [updated] = await db
      .update(users)
      .set({ name: body.name, updatedAt: new Date() })
      .where(eq(users.id, authUser.sub))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Failed to update account"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
