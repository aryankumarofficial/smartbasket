const DEFAULT_AI_SERVICE_URL = "http://localhost:8000"

/**
 * Resolves AI base URL safely:
 * - empty/whitespace env -> default
 * - relative/path values (e.g. "/") -> default
 * - invalid URL -> default
 */
export function resolveAiServiceUrl(raw = process.env.AI_SERVICE_URL): string {
  const candidate = raw?.trim()
  if (!candidate) return DEFAULT_AI_SERVICE_URL

  try {
    const parsed = new URL(candidate)
    if (!/^https?:$/.test(parsed.protocol)) {
      return DEFAULT_AI_SERVICE_URL
    }
    return parsed.origin
  } catch {
    return DEFAULT_AI_SERVICE_URL
  }
}

export const AI_SERVICE_URL = resolveAiServiceUrl()
