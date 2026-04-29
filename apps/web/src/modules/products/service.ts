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

  async getById(id: string) {
    return productsRepository.getById(id)
  },

  async create(input: ProductUpsertInput) {
    validateProductInput(input)
    const created = await productsRepository.create(input)
    await enqueueTagGeneration(created.id)
    return created
  },

  async update(id: string, input: Partial<ProductUpsertInput>) {
    const updated = await productsRepository.update(id, {
      ...input,
      name: input.title,
    })
    if (updated) {
      await enqueueTagGeneration(id)
    }
    return updated
  },
}
