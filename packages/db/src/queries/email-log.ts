import { eq } from "drizzle-orm"

import { db } from "../client.js"
import { emailLogs } from "../schema/email-logs.js"

export type EmailLogStatus = "pending" | "sent" | "failed"

export async function createEmailLog(input: {
  userId: string | null
  recipientEmail: string
  emailType: string
  status?: EmailLogStatus
}) {
  const [row] = await db
    .insert(emailLogs)
    .values({
      userId: input.userId,
      recipientEmail: input.recipientEmail,
      emailType: input.emailType,
      status: input.status ?? "pending",
    })
    .returning()
  if (!row) {
    throw new Error("Failed to create email log")
  }
  return row
}

export async function updateEmailLog(
  id: string,
  patch: { status: EmailLogStatus; errorMessage?: string | null }
) {
  const [row] = await db
    .update(emailLogs)
    .set({
      status: patch.status,
      errorMessage: patch.errorMessage ?? null,
      updatedAt: new Date(),
    })
    .where(eq(emailLogs.id, id))
    .returning()
  return row
}
