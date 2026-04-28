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
import { userEvents } from "./user-events.js"
import { orderItems, orders } from "./orders.js"
import { cartItems, carts } from "./carts.js"

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
    category: text("category").notNull(),
    subcategory: text("subcategory"),
    imageUrl: text("image_url"),
    images: jsonb("images").$type<string[]>(),
    tags: jsonb("tags").$type<string[]>(),
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
  ]
)

export const productsRelations = relations(products, ({ many }) => ({
  events: many(userEvents),

  cartItems: many(cartItems),

  orderItems: many(orderItems),
}))
