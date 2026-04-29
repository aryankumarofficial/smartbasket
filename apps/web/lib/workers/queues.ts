import IORedis from "ioredis"
import { Queue, type JobsOptions } from "bullmq"

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

export const queueNames = {
  profileAggregation: "profile-aggregation",
  embeddingGeneration: "embedding-generation",
  recommendationPrecompute: "recommendation-precompute",
  sessionCleanup: "session-cleanup",
  cacheCleanup: "cache-cleanup",
} as const

export const queues = {
  profileAggregation: new Queue(queueNames.profileAggregation, {
    connection,
  }),
  embeddingGeneration: new Queue(queueNames.embeddingGeneration, {
    connection,
  }),
  recommendationPrecompute: new Queue(queueNames.recommendationPrecompute, {
    connection,
  }),
  sessionCleanup: new Queue(queueNames.sessionCleanup, { connection }),
  cacheCleanup: new Queue(queueNames.cacheCleanup, { connection }),
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
