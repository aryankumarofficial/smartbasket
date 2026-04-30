import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { signPasswordResetToken } from "@/src/lib/auth/password-reset-token"
import { enqueueEmailJob } from "@/src/queues/email.queue"
import { appBaseUrl } from "@/src/emails/theme"
import { createEmailLog } from "@workspace/db/queries/email-log"
import { getUserByEmail } from "@workspace/db/queries/user"

const bodySchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  const generic = {
    ok: true as const,
    message: "If an account exists for that email, you will receive reset instructions shortly.",
  }

  try {
    const body = bodySchema.parse(await request.json())
    const user = await getUserByEmail(body.email.toLowerCase())

    if (user) {
      try {
        const token = await signPasswordResetToken(user.id)
        const resetUrl = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`

        const log = await createEmailLog({
          userId: user.id,
          recipientEmail: user.email,
          emailType: "SEND_PASSWORD_RESET",
        })

        await enqueueEmailJob({
          type: "SEND_PASSWORD_RESET",
          emailLogId: log.id,
          userId: user.id,
          resetUrl,
        })
      } catch (err) {
        console.error("[forgot-password] enqueue failed", err)
        return NextResponse.json(
          { error: "Email service is temporarily unavailable." },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(generic)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid body", details: error.flatten() },
        { status: 400 }
      )
    }
    return NextResponse.json(generic)
  }
}
