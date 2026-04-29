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
import { generateProductEmbeddings } from "./embedding-generator"
import { precomputeRecommendations } from "./recommendation-precomputer"
import { cleanupCache, cleanupSessions } from "./session-cleanup"
import IORedis from "ioredis"

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379"

let workersStarted = false
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

export function startQueueWorkers() {
  if (workersStarted) return
  workersStarted = true

  new Worker(queueNames.profileAggregation, async () => aggregateAllProfiles(), {
    connection,
  })
  new Worker(queueNames.embeddingGeneration, async () => generateProductEmbeddings(), {
    connection,
  })
  new Worker(
    queueNames.recommendationPrecompute,
    async () => precomputeRecommendations(),
    { connection }
  )
  new Worker(queueNames.sessionCleanup, async () => cleanupSessions(), {
    connection,
  })
  new Worker(queueNames.cacheCleanup, async () => cleanupCache(), {
    connection,
  })
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
