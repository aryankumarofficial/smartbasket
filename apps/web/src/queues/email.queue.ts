import type { JobsOptions } from "bullmq"

import { queues } from "@/lib/workers/queues"

const emailJobOptions: JobsOptions = {
  attempts: 3,
  removeOnComplete: 200,
  removeOnFail: 200,
  backoff: { type: "exponential", delay: 2000 },
}

export type EmailJobPayload =
  | {
      type: "SEND_ORDER_CONFIRMATION"
      emailLogId: string
      orderId: string
    }
  | {
      type: "SEND_ORDER_SHIPPED"
      emailLogId: string
      orderId: string
    }
  | {
      type: "SEND_PASSWORD_RESET"
      emailLogId: string
      userId: string
      resetUrl: string
    }

export async function enqueueEmailJob(payload: EmailJobPayload) {
  return queues.emailDelivery.add("deliver", payload, emailJobOptions)
}
