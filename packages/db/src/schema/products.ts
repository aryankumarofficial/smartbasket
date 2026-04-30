import { relations } from "drizzle-orm"
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { userEvents } from "./user-events"
import { orderItems } from "./orders"
import { cartItems } from "./carts"
import { categories } from "./categories"
import { productEmbeddings } from "./product-embeddings"
import { productViews } from "./product-views"

export type ProductTagCategory =
  | "use_case"
  | "audience"
  | "price_segment"
  | "type"

export interface ProductTag {
  tag: string
  category: ProductTagCategory
  weight: number
  source: "manual" | "ai"
}

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title"),
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
    category: text("category").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    subcategory: text("subcategory"),
    imageUrl: text("image_url"),
    images: jsonb("images").$type<string[]>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    tags: jsonb("tags").$type<string[]>(),
    manualTags: jsonb("manual_tags").$type<ProductTag[]>().default([]),
    aiTags: jsonb("ai_tags").$type<ProductTag[]>().default([]),
    finalTags: jsonb("final_tags").$type<ProductTag[]>().default([]),
    occasions: jsonb("occasions").$type<string[]>(),
    recipientTypes: jsonb("recipient_types").$type<string[]>(),
    ageGroups: jsonb("age_groups").$type<string[]>(),
    brand: text("brand"),
    inStock: boolean("in_stock").default(true),
    inventoryCount: integer("inventory_count").default(0),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewCount: integer("review_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("products_category_idx").on(table.category),
    index("products_price_idx").on(table.price),
    index("products_occasions_idx").on(table.occasions),
    index("products_recipeint_idx").on(table.recipientTypes),
    index("products_tags_idx").on(table.tags),
    index("products_manual_tags_idx").on(table.manualTags),
    index("products_ai_tags_idx").on(table.aiTags),
    index("products_final_tags_idx").on(table.finalTags),
  ]
)

export const productsRelations = relations(products, ({ one, many }) => ({
  events: many(userEvents),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  categoryRef: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  embeddings: one(productEmbeddings, {
    fields: [products.id],
    references: [productEmbeddings.productId],
  }),
  views: many(productViews),
}))
