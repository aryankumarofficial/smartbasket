import { db } from "../client.js"
import { products } from "../schema/products.js"
import { eq, and, gte, lte } from "drizzle-orm"

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
