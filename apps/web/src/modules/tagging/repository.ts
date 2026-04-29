import {
  getProductById,
  updateProduct,
} from "@workspace/db/queries/product"
import type { StructuredTag } from "./types"

export const taggingRepository = {
  async getProduct(productId: string) {
    return getProductById(productId)
  },

  async updateAiAndFinalTags(
    productId: string,
    aiTags: StructuredTag[],
    finalTags: StructuredTag[]
  ) {
    return updateProduct(productId, { aiTags, finalTags })
  },

  async updateManualAndFinalTags(
    productId: string,
    manualTags: StructuredTag[],
    finalTags: StructuredTag[]
  ) {
    return updateProduct(productId, { manualTags, finalTags })
  },
}
