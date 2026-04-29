import { Worker } from "bullmq"
import {
  queueNames,
  enqueueCacheCleanup,
  enqueueEmbeddingGeneration,
  enqueueProfileAggregation,
  enqueueRecommendationPrecompute,
  enqueueSessionCleanup,
} from "./queues"
import { aggregateAllProfiles } from "./profile-aggregator"
import {
  generateProductEmbeddings,
  generateSingleProductEmbedding,
} from "./embedding-generator"
import {
  precomputeForUser,
  precomputeRecommendations,
} from "./recommendation-precomputer"
import { cleanupCache, cleanupSessions } from "./session-cleanup"
import IORedis from "ioredis"
import { aggregateUserProfile } from "./profile-aggregator"
import { startTaggingWorker } from "@/src/workers/tagging.worker"

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"

let workersStarted = false
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

export function startQueueWorkers() {
  if (workersStarted) return
  workersStarted = true

  new Worker(
    queueNames.profileAggregation,
    async (job) =>
      job.data?.userId
        ? aggregateUserProfile(job.data.userId as string)
        : aggregateAllProfiles(),
    { connection }
  )
  new Worker(
    queueNames.embeddingGeneration,
    async (job) =>
      job.data?.productId
        ? generateSingleProductEmbedding(job.data.productId as string)
        : generateProductEmbeddings(),
    { connection }
  )
  new Worker(
    queueNames.recommendationPrecompute,
    async (job) =>
      job.data?.userId
        ? precomputeForUser(job.data.userId as string)
        : precomputeRecommendations(),
    { connection }
  )
  new Worker(queueNames.sessionCleanup, async () => cleanupSessions(), {
    connection,
  })
  new Worker(queueNames.cacheCleanup, async () => cleanupCache(), {
    connection,
  })
  startTaggingWorker()
}

export async function enqueueRecurringJobs() {
  await Promise.all([
    enqueueProfileAggregation(),
    enqueueEmbeddingGeneration(),
    enqueueRecommendationPrecompute(),
    enqueueSessionCleanup(),
    enqueueCacheCleanup(),
  ])
}
