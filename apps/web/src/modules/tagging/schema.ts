import type { ProductTagSignal, StructuredTag } from "./types"

const tagCategories = new Set([
  "use_case",
  "audience",
  "price_segment",
  "type",
])

const synonymMap: Record<string, string> = {
  cheap: "budget",
  affordable: "budget",
  expensive: "premium",
  luxury: "premium",
  luxe: "premium",
}

function normalizeToken(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_")
  return synonymMap[normalized] ?? normalized
}

export function normalizeTags(tags: StructuredTag[]): StructuredTag[] {
  return tags
    .filter((tag) => tag?.tag && tag?.category)
    .filter((tag) => tagCategories.has(tag.category))
    .map((tag) => ({
      ...tag,
      tag: normalizeToken(tag.tag),
      weight: Math.max(0, Math.min(1, Number(tag.weight) || 0.5)),
    }))
}

export function mergeTags(
  manualTags: StructuredTag[],
  aiTags: StructuredTag[]
): StructuredTag[] {
  const normalizedManual = normalizeTags(manualTags).map((tag) => ({
    ...tag,
    source: "manual" as const,
  }))
  const normalizedAi = normalizeTags(aiTags).map((tag) => ({
    ...tag,
    source: "ai" as const,
  }))

  const merged = new Map<string, StructuredTag>()

  for (const tag of normalizedAi) {
    merged.set(`${tag.category}:${tag.tag}`, tag)
  }
  for (const tag of normalizedManual) {
    merged.set(`${tag.category}:${tag.tag}`, tag)
  }

  return [...merged.values()].sort((a, b) => b.weight - a.weight)
}

function signalBoost(signal: ProductTagSignal): number {
  const views = Math.max(0, Number(signal.viewCount || 0))
  const clicks = Math.max(0, Number(signal.clickCount || 0))
  const purchases = Math.max(0, Number(signal.purchaseCount || 0))

  // Small, bounded boost — prevents runaway weight inflation.
  const raw = 0.004 * views + 0.02 * clicks + 0.08 * purchases
  return Math.max(0, Math.min(0.25, raw))
}

export function applySignalsToMergedTags(
  tags: StructuredTag[],
  signals: ProductTagSignal[]
): StructuredTag[] {
  if (!signals?.length) return tags

  const signalMap = new Map<string, ProductTagSignal>()
  for (const s of signals) {
    if (!s?.tag || !s?.category) continue
    signalMap.set(`${s.category}:${normalizeToken(s.tag)}`, {
      ...s,
      tag: normalizeToken(s.tag),
    })
  }

  return tags
    .map((t) => {
      const key = `${t.category}:${t.tag}`
      const s = signalMap.get(key)
      if (!s) return t
      const boosted = Math.max(0, Math.min(1, t.weight + signalBoost(s)))
      return { ...t, weight: boosted }
    })
    .sort((a, b) => b.weight - a.weight)
}
