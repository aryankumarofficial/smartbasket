import { Worker } from "bullmq"
import { taggingService } from "@/src/modules/tagging/service"
import {
  enqueueTaggingGeneration,
  queueConnection,
  queueNames,
} from "@/lib/workers/queues"

export async function enqueueTagGeneration(productId: string) {
  return enqueueTaggingGeneration({ productId })
}

export function startTaggingWorker() {
  return new Worker(
    queueNames.taggingGeneration,
    async (job) => {
      const productId = job.data?.productId as string
      if (!productId) {
        throw new Error("Missing productId in generate-product-tags job")
      }
      await taggingService.generateAndPersistAiTags(productId)
    },
    { connection: queueConnection }
  )
}
