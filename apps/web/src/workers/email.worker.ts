import type { Job } from "bullmq"
import { Worker } from "bullmq"
import type IORedis from "ioredis"

import { queueNames } from "@/lib/workers/queues"
import { getUserById } from "@workspace/db/queries/user"
import { getOrderEmailContext } from "@workspace/db/queries/orders"
import { updateEmailLog } from "@workspace/db/queries/email-log"
import { emailService } from "@/src/services/email.service"
import type { EmailJobPayload } from "@/src/queues/email.queue"

let started = false

function isEmailJobPayload(data: unknown): data is EmailJobPayload {
  if (!data || typeof data !== "object") return false
  const t = (data as { type?: string }).type
  if (t === "SEND_ORDER_CONFIRMATION" || t === "SEND_ORDER_SHIPPED") {
    const o = data as { emailLogId?: string; orderId?: string }
    return Boolean(o.emailLogId && o.orderId)
  }
  if (t === "SEND_PASSWORD_RESET") {
    const o = data as { emailLogId?: string; userId?: string; resetUrl?: string }
    return Boolean(o.emailLogId && o.userId && o.resetUrl)
  }
  if (t === "ADMIN_ONBOARDING") {
    const o = data as {
      emailLogId?: string
      userId?: string
      temporaryPassword?: string
      loginUrl?: string
    }
    return Boolean(
      o.emailLogId && o.userId && o.temporaryPassword && o.loginUrl
    )
  }
  return false
}

async function handleJobFailure(
  emailLogId: string,
  job: Job,
  err: unknown
): Promise<void> {
  const message = err instanceof Error ? err.message : String(err)
  const maxAttempts = job.opts.attempts ?? 3
  const terminal = job.attemptsMade >= maxAttempts
  await updateEmailLog(emailLogId, {
    status: terminal ? "failed" : "pending",
    errorMessage: message,
  })
}

export async function processEmailJob(job: Job): Promise<void> {
  const data = job.data
  if (!isEmailJobPayload(data)) {
    throw new Error("Invalid email job payload")
  }

  if (data.type === "SEND_ORDER_CONFIRMATION") {
    const ctx = await getOrderEmailContext(data.orderId)
    if (!ctx) {
      await updateEmailLog(data.emailLogId, {
        status: "failed",
        errorMessage: "Order not found",
      })
      return
    }
    try {
      await emailService.sendOrderConfirmation({
        to: ctx.userEmail,
        customerName: ctx.userName,
        orderId: ctx.orderId,
        total: String(ctx.totalAmount),
        currency: ctx.currency ?? "INR",
        items: ctx.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          priceAtPurchase: String(i.priceAtPurchase),
        })),
      })
      await updateEmailLog(data.emailLogId, { status: "sent", errorMessage: null })
    } catch (e) {
      await handleJobFailure(data.emailLogId, job, e)
      throw e
    }
    return
  }

  if (data.type === "SEND_ORDER_SHIPPED") {
    const ctx = await getOrderEmailContext(data.orderId)
    if (!ctx) {
      await updateEmailLog(data.emailLogId, {
        status: "failed",
        errorMessage: "Order not found",
      })
      return
    }
    try {
      await emailService.sendOrderShipped({
        to: ctx.userEmail,
        customerName: ctx.userName,
        orderId: ctx.orderId,
        carrier: "SmartBasket Express",
        trackingNumber: `SB-IN-${data.orderId.replace(/-/g, "").slice(0, 10).toUpperCase()}`,
        estimatedDelivery: "3–5 business days",
      })
      await updateEmailLog(data.emailLogId, { status: "sent", errorMessage: null })
    } catch (e) {
      await handleJobFailure(data.emailLogId, job, e)
      throw e
    }
    return
  }

  if (data.type === "SEND_PASSWORD_RESET") {
    const user = await getUserById(data.userId)
    if (!user) {
      await updateEmailLog(data.emailLogId, {
        status: "failed",
        errorMessage: "User not found",
      })
      return
    }
    try {
      await emailService.sendPasswordReset({
        to: user.email,
        customerName: user.name,
        resetUrl: data.resetUrl,
        expiresInLabel: "1 hour",
      })
      await updateEmailLog(data.emailLogId, { status: "sent", errorMessage: null })
    } catch (e) {
      await handleJobFailure(data.emailLogId, job, e)
      throw e
    }
    return
  }

  if (data.type === "ADMIN_ONBOARDING") {
    const user = await getUserById(data.userId)
    if (!user) {
      await updateEmailLog(data.emailLogId, {
        status: "failed",
        errorMessage: "User not found",
      })
      return
    }
    try {
      await emailService.sendAdminOnboarding({
        to: user.email,
        adminName: user.name,
        role:
          user.role === "super_admin" || user.role === "admin"
            ? user.role
            : "admin",
        temporaryPassword: data.temporaryPassword,
        loginUrl: data.loginUrl,
      })
      await updateEmailLog(data.emailLogId, { status: "sent", errorMessage: null })
    } catch (e) {
      await handleJobFailure(data.emailLogId, job, e)
      throw e
    }
  }
}

export function startEmailWorker(connection: IORedis): void {
  if (started) return
  started = true

  new Worker(queueNames.emailDelivery, processEmailJob, {
    connection,
    concurrency: 4,
  })
}
