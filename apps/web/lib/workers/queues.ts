import IORedis from "ioredis"
import { Queue, type JobsOptions } from "bullmq"
import { getQueueRedisUrl } from "./redis"

const REDIS_URL = getQueueRedisUrl()

/**
 * Shared BullMQ Redis connection.
 * `lazyConnect` prevents an immediate TCP handshake on module load;
 * BullMQ will connect when the first job is enqueued / worker starts.
 */
export const queueConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    // In development without a local Redis, stop retrying quickly.
    if (times > 5) {
      return null
    }
    return Math.min(times * 200, 3000)
  },
})

queueConnection.on("error", (err) => {
  // Log once-per-type instead of spamming the console.
  console.error("[BullMQ Redis]", err.message)
})

export const queueNames = {
  profileAggregation: "profile-aggregation",
  embeddingGeneration: "embedding-generation",
  recommendationPrecompute: "recommendation-precompute",
  sessionCleanup: "session-cleanup",
  cacheCleanup: "cache-cleanup",
  taggingGeneration: "generate-product-tags",
  tagSignalUpdate: "tag-signal-update",
  tagInsightsRefresh: "tag-insights-refresh",
  emailDelivery: "email-delivery",
} as const

export const queues = {
  profileAggregation: new Queue(queueNames.profileAggregation, {
    connection: queueConnection,
  }),
  embeddingGeneration: new Queue(queueNames.embeddingGeneration, {
    connection: queueConnection,
  }),
  recommendationPrecompute: new Queue(queueNames.recommendationPrecompute, {
    connection: queueConnection,
  }),
  sessionCleanup: new Queue(queueNames.sessionCleanup, {
    connection: queueConnection,
  }),
  cacheCleanup: new Queue(queueNames.cacheCleanup, {
    connection: queueConnection,
  }),
  taggingGeneration: new Queue(queueNames.taggingGeneration, {
    connection: queueConnection,
  }),
  tagSignalUpdate: new Queue(queueNames.tagSignalUpdate, {
    connection: queueConnection,
  }),
  tagInsightsRefresh: new Queue(queueNames.tagInsightsRefresh, {
    connection: queueConnection,
  }),
  emailDelivery: new Queue(queueNames.emailDelivery, {
    connection: queueConnection,
  }),
}

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  removeOnComplete: 100,
  removeOnFail: 100,
  backoff: { type: "exponential", delay: 1000 },
}

export async function enqueueProfileAggregation(
  payload: { userId?: string } = {}
) {
  return queues.profileAggregation.add("aggregate", payload, defaultJobOptions)
}

export async function enqueueEmbeddingGeneration(
  payload: { productId?: string } = {}
) {
  return queues.embeddingGeneration.add("generate", payload, defaultJobOptions)
}

export async function enqueueRecommendationPrecompute(
  payload: { userId?: string } = {}
) {
  return queues.recommendationPrecompute.add(
    "precompute",
    payload,
    defaultJobOptions
  )
}

export async function enqueueSessionCleanup() {
  return queues.sessionCleanup.add("cleanup", {}, defaultJobOptions)
}

export async function enqueueCacheCleanup() {
  return queues.cacheCleanup.add("cleanup", {}, defaultJobOptions)
}

export async function enqueueTaggingGeneration(payload: { productId: string }) {
  return queues.taggingGeneration.add(
    "generate-product-tags",
    payload,
    defaultJobOptions
  )
}

export async function enqueueTagSignalUpdate(payload: {
  productId: string
  eventType: "view" | "click" | "purchase"
  delta?: number
}) {
  return queues.tagSignalUpdate.add("tag-signal-update", payload, {
    ...defaultJobOptions,
    attempts: 5,
  })
}

export async function enqueueTagInsightsRefresh(payload: { reason?: string } = {}) {
  return queues.tagInsightsRefresh.add("tag-insights-refresh", payload, {
    ...defaultJobOptions,
    attempts: 2,
  })
}
