import { db } from "../client.js"
import { products } from "../schema/products.js"
import { eq, and, gte, lte } from "drizzle-orm"
import type { ProductTag } from "../schema/products.js"

export const getProductById = async (id: string) => {
  return db.query.products.findFirst({
    where: eq(products.id, id),
  })
}

export const getProducts = async (filters: {
  minPrice?: number
  maxPrice?: number
  category?: string
}) => {
  const conditions = []

  if (filters.minPrice) {
    conditions.push(gte(products.price, filters.minPrice.toString()))
  }

  if (filters.maxPrice) {
    conditions.push(lte(products.price, filters.maxPrice.toString()))
  }

  if (filters.category) {
    conditions.push(eq(products.category, filters.category))
  }

  return db
    .select()
    .from(products)
    .where(and(...conditions))
}

export const createProduct = async (data: {
  title?: string
  name: string
  description?: string | null
  price: string
  category: string
  categoryId?: string
  images?: string[]
  metadata?: Record<string, unknown>
  manualTags?: ProductTag[]
}) => {
  const [created] = await db
    .insert(products)
    .values({
      ...data,
      manualTags: data.manualTags ?? [],
      aiTags: [],
      finalTags: data.manualTags ?? [],
    })
    .returning()
  return created
}

export const updateProduct = async (
  productId: string,
  data: Partial<{
    title: string
    name: string
    description: string | null
    price: string
    category: string
    categoryId: string
    images: string[]
    metadata: Record<string, unknown>
    manualTags: ProductTag[]
    aiTags: ProductTag[]
    finalTags: ProductTag[]
  }>
) => {
  const [updated] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, productId))
    .returning()
  return updated
}

export const deleteProduct = async (productId: string) => {
  const [deleted] = await db.delete(products).where(eq(products.id, productId)).returning()
  return deleted
}
