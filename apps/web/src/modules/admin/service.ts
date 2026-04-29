import { adminRepository } from "./repository"
import { taggingService } from "@/src/modules/tagging/service"
import type { StructuredTag } from "@/src/modules/tagging/types"

export const adminService = {
  async updateProductTags(productId: string, manualTags: StructuredTag[]) {
    const existing = await adminRepository.getProductById(productId)
    if (!existing) {
      throw new Error("Product not found")
    }
    return taggingService.saveManualTags(productId, manualTags)
  },
}
