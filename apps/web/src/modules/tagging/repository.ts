import {
  getProductById,
  updateProduct,
} from "@workspace/db/queries/product"
import { getProductTagSignals } from "@workspace/db/queries/product-tag-signal"
import type { StructuredTag } from "./types"

export const taggingRepository = {
  async getProduct(productId: string) {
    return getProductById(productId)
  },

  async getProductTagSignals(productId: string) {
    return getProductTagSignals(productId)
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
