import type { ProductUpsertInput } from "./types"

export function validateProductInput(input: ProductUpsertInput) {
  if (!input.title?.trim()) throw new Error("title is required")
  if (!input.category?.trim()) throw new Error("category is required")
  if (!input.price || Number(input.price) <= 0) {
    throw new Error("price must be positive")
  }
}
