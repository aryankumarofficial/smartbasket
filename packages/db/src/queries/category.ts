import { eq, isNull } from "drizzle-orm"
import { db } from "../client"
import { categories } from "../schema/categories"

export const getCategoryById = async (id: string) => {
  return db.query.categories.findFirst({
    where: eq(categories.id, id),
  })
}

export const getCategoryBySlug = async (slug: string) => {
  return db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  })
}

export const getRootCategories = async () => {
  return db.query.categories.findMany({
    where: isNull(categories.parentId),
  })
}

export const getSubcategories = async (parentId: string) => {
  return db.query.categories.findMany({
    where: eq(categories.parentId, parentId),
  })
}

export const getAllCategories = async () => {
  return db.query.categories.findMany({
    orderBy: categories.name,
  })
}

export const createCategory = async (data: {
  name: string
  slug: string
  description?: string
  parentId?: string
  imageUrl?: string
  metadata?: Record<string, unknown>
}) => {
  const [category] = await db.insert(categories).values(data).returning()
  return category
}
