const LOCAL_REDIS_URL = "redis://127.0.0.1:6379"

function isRedisScheme(url: string): boolean {
  return url.startsWith("redis://") || url.startsWith("rediss://")
}

/**
 * Resolve a BullMQ-compatible Redis URL.
 * Falls back to local Redis in development if REDIS_URL is invalid.
 */
export function getQueueRedisUrl(): string {
  const raw = process.env.REDIS_URL?.trim()

  if (!raw) {
    return LOCAL_REDIS_URL
  }

  if (isRedisScheme(raw)) {
    return raw
  }

  const message =
    `[Workers] Invalid REDIS_URL scheme: "${raw}". ` +
    `Expected redis:// or rediss://.`

  if (process.env.NODE_ENV === "development") {
    console.warn(`${message} Falling back to ${LOCAL_REDIS_URL}.`)
    return LOCAL_REDIS_URL
  }

  throw new Error(`${message} Set a valid Redis connection string.`)
}
