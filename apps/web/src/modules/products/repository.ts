import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "@workspace/db/queries/product"
import type { ProductUpsertInput } from "./types"

export const productsRepository = {
  list: getProducts,
  getById: getProductById,
  create: (input: ProductUpsertInput) =>
    createProduct({
      title: input.title,
      name: input.title,
      description: input.description,
      price: input.price,
      category: input.category,
      categoryId: input.categoryId,
      images: input.images,
      metadata: input.metadata,
      manualTags: input.manualTags,
    }),
  update: updateProduct,
}
