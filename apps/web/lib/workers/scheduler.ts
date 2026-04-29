import { aggregateAllProfiles } from "./profile-aggregator"
import { generateProductEmbeddings } from "./embedding-generator"
import { precomputeRecommendations } from "./recommendation-precomputer"
import { cleanupSessions, cleanupCache } from "./session-cleanup"

interface ScheduledJob {
  name: string
  intervalMs: number
  fn: () => Promise<unknown>
  lastRun?: number
}

const jobs: ScheduledJob[] = [
  {
    name: "profile-aggregation",
    intervalMs: 60 * 60 * 1000, // every hour
    fn: aggregateAllProfiles,
  },
  {
    name: "embedding-generation",
    intervalMs: 6 * 60 * 60 * 1000, // every 6 hours
    fn: generateProductEmbeddings,
  },
  {
    name: "recommendation-precompute",
    intervalMs: 30 * 60 * 1000, // every 30 minutes
    fn: precomputeRecommendations,
  },
  {
    name: "session-cleanup",
    intervalMs: 24 * 60 * 60 * 1000, // daily
    fn: cleanupSessions,
  },
  {
    name: "cache-cleanup",
    intervalMs: 15 * 60 * 1000, // every 15 minutes
    fn: cleanupCache,
  },
]

let timers: NodeJS.Timeout[] = []

export function startScheduler(): void {
  console.log("[Scheduler] Starting background job scheduler...")

  for (const job of jobs) {
    console.log(
      `[Scheduler] Registering job: ${job.name} (interval: ${job.intervalMs / 1000}s)`
    )

    const timer = setInterval(async () => {
      console.log(`[Scheduler] Running job: ${job.name}`)
      try {
        await job.fn()
        job.lastRun = Date.now()
        console.log(`[Scheduler] Job ${job.name} completed`)
      } catch (error) {
        console.error(`[Scheduler] Job ${job.name} failed:`, error)
      }
    }, job.intervalMs)

    timers.push(timer)
  }

  console.log(`[Scheduler] ${jobs.length} jobs registered`)
}

export function stopScheduler(): void {
  console.log("[Scheduler] Stopping scheduler...")
  for (const timer of timers) {
    clearInterval(timer)
  }
  timers = []
}

export function getJobStatus(): {
  name: string
  intervalMs: number
  lastRun?: number
}[] {
  return jobs.map((j) => ({
    name: j.name,
    intervalMs: j.intervalMs,
    lastRun: j.lastRun,
  }))
}

export async function runJob(
  jobName: string
): Promise<unknown> {
  const job = jobs.find((j) => j.name === jobName)
  if (!job) {
    throw new Error(`Job not found: ${jobName}`)
  }

  console.log(`[Scheduler] Manually running job: ${jobName}`)
  const result = await job.fn()
  job.lastRun = Date.now()
  return result
}
