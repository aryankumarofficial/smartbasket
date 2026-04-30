import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  listProductsForAdmin,
  updateProduct,
} from "@workspace/db/queries/product"
import type { ProductUpsertInput } from "./types"

export const productsRepository = {
  list: getProducts,
  listAdmin: listProductsForAdmin,
  getById: getProductById,
  create: (input: ProductUpsertInput) =>
    createProduct({
      title: input.title,
      name: input.title,
      description: input.description,
      price: input.price,
      originalPrice: input.originalPrice ?? null,
      category: input.category,
      categoryId: input.categoryId,
      subcategory: input.subcategory ?? null,
      brand: input.brand ?? null,
      images: input.images,
      metadata: input.metadata,
      manualTags: input.manualTags,
      inventoryCount: input.inventoryCount,
      inStock: input.inStock,
    }),
  update: updateProduct,
  delete: deleteProduct,
}
