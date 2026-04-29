import { applySignalsToMergedTags, mergeTags, normalizeTags } from "./schema"
import { taggingRepository } from "./repository"
import type { ProductTagSignal, StructuredTag } from "./types"
import { llmService } from "@/src/services/llm.service"

export const taggingService = {
  async generateAndPersistAiTags(productId: string) {
    const product = await taggingRepository.getProduct(productId)
    if (!product) {
      throw new Error("Product not found")
    }

    const signalRows = await taggingRepository.getProductTagSignals(productId)
    const signals: ProductTagSignal[] = (signalRows ?? []).map((r) => ({
      tag: String((r as any).tag ?? ""),
      category: (r as any).category,
      viewCount: Number((r as any).viewCount ?? 0),
      clickCount: Number((r as any).clickCount ?? 0),
      purchaseCount: Number((r as any).purchaseCount ?? 0),
    }))

    const generated = await llmService.generateProductTags({
      productId: product.id,
      title: product.title ?? product.name,
      description: product.description,
      category: product.category,
      metadata:
        (product.metadata as Record<string, unknown> | undefined) ?? {},
    })
    const aiTags = normalizeTags(generated.tags)
    const manualTags = (product.manualTags as StructuredTag[] | null) ?? []
    const merged = mergeTags(manualTags, aiTags)
    const finalTags = applySignalsToMergedTags(merged, signals)

    return taggingRepository.updateAiAndFinalTags(productId, aiTags, finalTags)
  },

  async saveManualTags(productId: string, manualTags: StructuredTag[]) {
    const product = await taggingRepository.getProduct(productId)
    if (!product) {
      throw new Error("Product not found")
    }

    const signalRows = await taggingRepository.getProductTagSignals(productId)
    const signals: ProductTagSignal[] = (signalRows ?? []).map((r) => ({
      tag: String((r as any).tag ?? ""),
      category: (r as any).category,
      viewCount: Number((r as any).viewCount ?? 0),
      clickCount: Number((r as any).clickCount ?? 0),
      purchaseCount: Number((r as any).purchaseCount ?? 0),
    }))

    const normalizedManual = normalizeTags(manualTags).map((tag) => ({
      ...tag,
      source: "manual" as const,
    }))
    const existingAi = (product.aiTags as StructuredTag[] | null) ?? []
    const merged = mergeTags(normalizedManual, existingAi)
    const finalTags = applySignalsToMergedTags(merged, signals)

    return taggingRepository.updateManualAndFinalTags(
      productId,
      normalizedManual,
      finalTags
    )
  },
}
