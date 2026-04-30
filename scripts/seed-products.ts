import { inArray } from "drizzle-orm"

import { db } from "@workspace/db/client"
import type { ProductTag, ProductTagCategory } from "@workspace/db/schema/products"
import { categories, products } from "@workspace/db/schema"
import {
  buildProductName,
  pickManyUnique,
  pickOne,
  randomDateWithinDays,
  randomFloat,
  randomInt,
} from "../lib/faker"

export interface SeedProductResult {
  id: string
  name: string
  category: string
  price: number
  finalTags: ProductTag[]
}

const CATEGORY_CONFIG = [
  { name: "Tech Gifts", slug: "tech-gifts" },
  { name: "Fashion Accessories", slug: "fashion-accessories" },
  { name: "Home Decor", slug: "home-decor" },
  { name: "Wellness", slug: "wellness" },
  { name: "Books & Journals", slug: "books-journals" },
  { name: "Gourmet", slug: "gourmet" },
]

const USE_CASE_TAGS = [
  "birthday",
  "anniversary",
  "wedding",
  "housewarming",
  "graduation",
]
const AUDIENCE_TAGS = ["men", "women", "unisex", "teens", "parents", "colleagues"]
const PRICE_SEGMENT_TAGS = ["budget", "mid-range", "premium"]
const TYPE_TAGS = ["personalized", "luxury", "utility", "experience", "handmade"]

function buildTag(tag: string, category: ProductTagCategory, source: "manual" | "ai"): ProductTag {
  return {
    tag,
    category,
    source,
    weight: Number(randomFloat(0.55, 0.98, 2)),
  }
}

function derivePriceSegment(price: number): string {
  if (price < 1200) return "budget"
  if (price < 4000) return "mid-range"
  return "premium"
}

export async function seedProducts(): Promise<SeedProductResult[]> {
  for (const category of CATEGORY_CONFIG) {
    await db
      .insert(categories)
      .values({
        name: category.name,
        slug: category.slug,
        description: `${category.name} curated for gifting journeys`,
      })
      .onConflictDoNothing()
  }

  const categoryRows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(inArray(categories.slug, CATEGORY_CONFIG.map((c) => c.slug)))

  const byName = new Map(categoryRows.map((row) => [row.name, row.id]))
  const targetCount = randomInt(60, 85)
  const seededProducts: SeedProductResult[] = []

  for (let i = 1; i <= targetCount; i += 1) {
    const category = pickOne(CATEGORY_CONFIG)
    const useCases = pickManyUnique(USE_CASE_TAGS, randomInt(1, 2))
    const audiences = pickManyUnique(AUDIENCE_TAGS, randomInt(1, 2))
    const typeTags = pickManyUnique(TYPE_TAGS, randomInt(1, 2))
    const price = Number(randomFloat(399, 8999, 2))
    const priceSegment = derivePriceSegment(price)

    const manualTags: ProductTag[] = [
      ...useCases.map((tag) => buildTag(tag, "use_case", "manual")),
      ...audiences.map((tag) => buildTag(tag, "audience", "manual")),
      buildTag(priceSegment, "price_segment", "manual"),
    ]
    const aiTags: ProductTag[] = [
      ...typeTags.map((tag) => buildTag(tag, "type", "ai")),
      ...pickManyUnique(USE_CASE_TAGS, 1).map((tag) => buildTag(tag, "use_case", "ai")),
    ]
    const finalTagMap = new Map<string, ProductTag>()
    for (const tag of [...manualTags, ...aiTags]) {
      const key = `${tag.category}:${tag.tag}`
      finalTagMap.set(key, tag)
    }
    const finalTags = [...finalTagMap.values()]

    const name = buildProductName(i)
    const [row] = await db
      .insert(products)
      .values({
        title: name,
        name,
        description: `${name} tailored for ${useCases.join(", ")} gifting journeys.`,
        price: price.toFixed(2),
        originalPrice: (price * randomFloat(1.05, 1.3, 2)).toFixed(2),
        category: category.name,
        categoryId: byName.get(category.name),
        subcategory: pickOne(["classic", "signature", "limited"]),
        imageUrl: `https://picsum.photos/seed/smartbasket-${i}/800/800`,
        images: [
          `https://picsum.photos/seed/smartbasket-${i}-1/800/800`,
          `https://picsum.photos/seed/smartbasket-${i}-2/800/800`,
        ],
        tags: finalTags.map((tag) => tag.tag),
        manualTags,
        aiTags,
        finalTags,
        occasions: useCases,
        recipientTypes: audiences,
        ageGroups: pickManyUnique(["teen", "young_adult", "adult"], randomInt(1, 2)),
        brand: pickOne(["SmartBasket Studio", "GiftLab", "Aurora", "Northline"]),
        inStock: true,
        inventoryCount: randomInt(10, 200),
        rating: randomFloat(3.4, 4.9, 2).toFixed(2),
        reviewCount: randomInt(5, 500),
        metadata: {
          seeded: true,
          priceSegment,
          useCases,
          audiences,
        },
        createdAt: randomDateWithinDays(180),
        updatedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning({
        id: products.id,
        name: products.name,
        category: products.category,
        price: products.price,
        finalTags: products.finalTags,
      })

    if (!row) continue
    seededProducts.push({
      id: row.id,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      finalTags: row.finalTags ?? [],
    })
  }

  return seededProducts
}
