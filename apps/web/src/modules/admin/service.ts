import { adminRepository } from "./repository"
import { taggingService } from "@/src/modules/tagging/service"
import type { StructuredTag } from "@/src/modules/tagging/types"
import type { AdminProductImagesPatchInput } from "./types"

export const adminService = {
  async updateProductTags(productId: string, manualTags: StructuredTag[]) {
    const existing = await adminRepository.getProductById(productId)
    if (!existing) {
      throw new Error("Product not found")
    }
    return taggingService.saveManualTags(productId, manualTags)
  },

  async patchProductImages(productId: string, input: AdminProductImagesPatchInput) {
    const existing = await adminRepository.getProductById(productId)
    if (!existing) {
      throw new Error("Product not found")
    }

    const current = (existing.images as string[] | null) ?? []
    const next =
      input.mode === "reorder"
        ? [...new Set(input.images.map((s) => s.trim()).filter(Boolean))]
        : input.mode === "append"
          ? [
              ...current,
              ...input.images.map((s) => s.trim()).filter(Boolean),
            ].filter(Boolean)
          : current.filter(
              (url) => !new Set(input.images.map((s) => s.trim())).has(url)
            )

    const normalized = [...new Set(next)]
    return adminRepository.updateProduct(productId, { images: normalized })
  },
}
