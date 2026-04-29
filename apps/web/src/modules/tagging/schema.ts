import type { StructuredTag } from "./types"

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
