import { and, eq, gte, lte, ilike, sql, or } from "drizzle-orm"
import { db, products } from "@workspace/db"

export interface SearchFilters {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  occasion?: string
  recipientType?: string
  tags?: string[]
  inStock?: boolean
  limit?: number
  offset?: number
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest" | "relevance"
}

export interface SearchResult {
  products: typeof products.$inferSelect[]
  total: number
  filters: SearchFilters
}

export class SearchService {
  async search(filters: SearchFilters): Promise<SearchResult> {
    const conditions = []

    if (filters.query) {
      conditions.push(
        or(
          ilike(products.name, `%${filters.query}%`),
          ilike(products.description, `%${filters.query}%`)
        )
      )
    }

    if (filters.category) {
      conditions.push(eq(products.category, filters.category))
    }

    if (filters.minPrice) {
      conditions.push(
        gte(products.price, filters.minPrice.toString())
      )
    }

    if (filters.maxPrice) {
      conditions.push(
        lte(products.price, filters.maxPrice.toString())
      )
    }

    if (filters.inStock !== undefined) {
      conditions.push(eq(products.inStock, filters.inStock))
    }

    if (filters.occasion) {
      conditions.push(
        sql`${products.occasions} @> ${JSON.stringify([filters.occasion])}::jsonb`
      )
    }

    if (filters.recipientType) {
      conditions.push(
        sql`${products.recipientTypes} @> ${JSON.stringify([filters.recipientType])}::jsonb`
      )
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(
        sql`${products.tags} ?| array[${sql.join(
          filters.tags.map((t) => sql`${t}`),
          sql`, `
        )}]`
      )
    }

    const limit = filters.limit ?? 20
    const offset = filters.offset ?? 0

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined

    const [results, countResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(this.getSortOrder(filters.sortBy)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause),
    ])

    return {
      products: results,
      total: countResult[0]?.count ?? 0,
      filters,
    }
  }

  async getProductsByIds(ids: string[]) {
    if (ids.length === 0) return []

    return db
      .select()
      .from(products)
      .where(
        sql`${products.id} = ANY(${ids})`
      )
  }

  private getSortOrder(sortBy?: string) {
    switch (sortBy) {
      case "price_asc":
        return products.price
      case "price_desc":
        return sql`${products.price} DESC`
      case "rating":
        return sql`${products.rating} DESC NULLS LAST`
      case "newest":
        return sql`${products.createdAt} DESC`
      default:
        return sql`${products.createdAt} DESC`
    }
  }
}

export const searchService = new SearchService()
