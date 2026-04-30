import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"
import { products } from "./products"

export type ProductTagSignalCategory =
  | "use_case"
  | "audience"
  | "price_segment"
  | "type"

/**
 * Per-product, per-tag counters derived from events.
 * This is the "learning" layer used to bias tag weights over time.
 */
export const productTagSignals = pgTable(
  "product_tag_signals",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    tag: text("tag").notNull(),
    category: text("category").notNull().$type<ProductTagSignalCategory>(),

    viewCount: integer("view_count").notNull().default(0),
    clickCount: integer("click_count").notNull().default(0),
    purchaseCount: integer("purchase_count").notNull().default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("product_tag_signals_product_tag_unique").on(
      table.productId,
      table.category,
      table.tag
    ),
    index("product_tag_signals_product_idx").on(table.productId),
    index("product_tag_signals_tag_idx").on(table.tag),
    index("product_tag_signals_category_idx").on(table.category),
  ]
)

