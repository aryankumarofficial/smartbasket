import { mergeTags, normalizeTags } from "./schema"
import { taggingRepository } from "./repository"
import type { StructuredTag } from "./types"
import { llmService } from "@/src/services/llm.service"

export const taggingService = {
  async generateAndPersistAiTags(productId: string) {
    const product = await taggingRepository.getProduct(productId)
    if (!product) {
      throw new Error("Product not found")
    }

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
    const finalTags = mergeTags(manualTags, aiTags)

    return taggingRepository.updateAiAndFinalTags(productId, aiTags, finalTags)
  },

  async saveManualTags(productId: string, manualTags: StructuredTag[]) {
    const product = await taggingRepository.getProduct(productId)
    if (!product) {
      throw new Error("Product not found")
    }

    const normalizedManual = normalizeTags(manualTags).map((tag) => ({
      ...tag,
      source: "manual" as const,
    }))
    const existingAi = (product.aiTags as StructuredTag[] | null) ?? []
    const finalTags = mergeTags(normalizedManual, existingAi)

    return taggingRepository.updateManualAndFinalTags(
      productId,
      normalizedManual,
      finalTags
    )
  },
}
