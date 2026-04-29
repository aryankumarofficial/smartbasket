import {
  enqueueCacheCleanup,
  enqueueEmbeddingGeneration,
  enqueueProfileAggregation,
  enqueueRecommendationPrecompute,
  enqueueSessionCleanup,
  enqueueTaggingGeneration,
  enqueueTagInsightsRefresh,
  queues,
} from "./queues"
import { startQueueWorkers } from "./worker-processors"

const jobs = [
  "profile-aggregation",
  "embedding-generation",
  "recommendation-precompute",
  "session-cleanup",
  "cache-cleanup",
  "generate-product-tags",
  "tag-insights-refresh",
] as const

export function startScheduler(): void {
  startQueueWorkers()
}

export function stopScheduler(): void {
  // Queue workers are long-lived in separate processes.
}

export async function getJobStatus() {
  const statuses = await Promise.all(
    jobs.map(async (jobName) => {
      const queue =
        jobName === "profile-aggregation"
          ? queues.profileAggregation
          : jobName === "embedding-generation"
            ? queues.embeddingGeneration
            : jobName === "recommendation-precompute"
              ? queues.recommendationPrecompute
              : jobName === "session-cleanup"
                ? queues.sessionCleanup
                : jobName === "cache-cleanup"
                  ? queues.cacheCleanup
                  : jobName === "generate-product-tags"
                    ? queues.taggingGeneration
                    : queues.tagInsightsRefresh
      const counts = await queue.getJobCounts()
      return { name: jobName, counts }
    })
  )
  return statuses
}

export async function runJob(
  jobName: string
): Promise<unknown> {
  switch (jobName) {
    case "profile-aggregation":
      return enqueueProfileAggregation()
    case "embedding-generation":
      return enqueueEmbeddingGeneration()
    case "recommendation-precompute":
      return enqueueRecommendationPrecompute()
    case "session-cleanup":
      return enqueueSessionCleanup()
    case "cache-cleanup":
      return enqueueCacheCleanup()
    case "generate-product-tags":
      throw new Error(
        "generate-product-tags requires a productId and is triggered on product create/update"
      )
    case "tag-insights-refresh":
      return enqueueTagInsightsRefresh({ reason: "manual" })
    default:
      throw new Error(`Job not found: ${jobName}`)
  }
}
