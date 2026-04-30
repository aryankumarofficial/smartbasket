import { productsRepository } from "./repository"
import { validateProductInput } from "./schema"
import type { ProductUpsertInput } from "./types"
import { enqueueTagGeneration } from "@/src/workers/tagging.worker"

export const productsService = {
  async list(filters: {
    category?: string
    minPrice?: number
    maxPrice?: number
  }) {
    return productsRepository.list(filters)
  },

  async listAdmin(filters: {
    q?: string
    category?: string
    page?: number
    limit?: number
    sort?: "name" | "price_desc" | "created_desc"
  }) {
    return productsRepository.listAdmin(filters)
  },

  async getById(id: string) {
    return productsRepository.getById(id)
  },

  async create(input: ProductUpsertInput) {
    validateProductInput(input)
    const created = await productsRepository.create(input)
    if (!created) {
      throw new Error("Failed to create product")
    }
    await enqueueTagGeneration(created.id)
    return created
  },

  async update(id: string, input: Partial<ProductUpsertInput>) {
    const updated = await productsRepository.update(id, {
      ...input,
      ...(input.title !== undefined ? { name: input.title } : {}),
    })
    if (updated) {
      await enqueueTagGeneration(id)
    }
    return updated
  },

  async remove(id: string) {
    return productsRepository.delete(id)
  },
}
