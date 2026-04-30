import { db } from "../client"
import { products } from "../schema/products"
import { and, asc, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm"
import type { ProductTag } from "../schema/products"

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
  originalPrice?: string | null
  category: string
  categoryId?: string
  subcategory?: string | null
  brand?: string | null
  images?: string[]
  imageUrl?: string | null
  metadata?: Record<string, unknown>
  manualTags?: ProductTag[]
  inventoryCount?: number
  inStock?: boolean
}) => {
  const [created] = await db
    .insert(products)
    .values({
      ...data,
      manualTags: data.manualTags ?? [],
      aiTags: [],
      finalTags: data.manualTags ?? [],
      inventoryCount: data.inventoryCount ?? 0,
      inStock: data.inStock ?? true,
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
    originalPrice: string | null
    category: string
    categoryId: string
    subcategory: string | null
    brand: string | null
    images: string[]
    imageUrl: string | null
    metadata: Record<string, unknown>
    manualTags: ProductTag[]
    aiTags: ProductTag[]
    finalTags: ProductTag[]
    inventoryCount: number
    inStock: boolean
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

export type AdminProductSort = "name" | "price_desc" | "created_desc"

export async function listProductsForAdmin(opts: {
  q?: string
  category?: string
  page?: number
  limit?: number
  sort?: AdminProductSort
}) {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(50, Math.max(1, opts.limit ?? 20))
  const offset = (page - 1) * limit

  const conditions = []
  if (opts.category?.trim()) {
    conditions.push(eq(products.category, opts.category.trim()))
  }
  if (opts.q?.trim()) {
    const pattern = `%${opts.q.trim()}%`
    conditions.push(
      or(ilike(products.name, pattern), ilike(products.description, pattern), ilike(products.title, pattern))
    )
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const orderBy =
    opts.sort === "price_desc"
      ? desc(products.price)
      : opts.sort === "name"
        ? asc(products.name)
        : desc(products.createdAt)

  const [totalRow] = await db
    .select({ c: count() })
    .from(products)
    .where(whereClause)

  const rows = await db
    .select()
    .from(products)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)

  return { products: rows, total: Number(totalRow?.c ?? 0) }
}
