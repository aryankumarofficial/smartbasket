import IORedis from "ioredis"
import { Queue, type JobsOptions } from "bullmq"

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"

export const queueConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

export const queueNames = {
  profileAggregation: "profile-aggregation",
  embeddingGeneration: "embedding-generation",
  recommendationPrecompute: "recommendation-precompute",
  sessionCleanup: "session-cleanup",
  cacheCleanup: "cache-cleanup",
  taggingGeneration: "generate-product-tags",
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
