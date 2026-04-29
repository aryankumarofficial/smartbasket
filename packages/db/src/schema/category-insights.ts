import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

/**
 * Precomputed category insights for admin analytics.
 */
export const categoryInsights = pgTable(
  "category_insights",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    category: text("category").notNull(),
    productCount: integer("product_count").notNull().default(0),

    computedAt: timestamp("computed_at").defaultNow().notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("category_insights_category_unique").on(table.category),
    index("category_insights_category_idx").on(table.category),
    index("category_insights_computed_idx").on(table.computedAt),
  ]
)

