import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export type TagInsightCategory =
  | "use_case"
  | "audience"
  | "price_segment"
  | "type"

/**
 * Precomputed global tag insights used by admin dashboards & analytics.
 * This avoids scanning jsonb `final_tags` on every request.
 */
export const tagInsights = pgTable(
  "tag_insights",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    tag: text("tag").notNull(),
    category: text("category").notNull().$type<TagInsightCategory>(),

    productCount: integer("product_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    clickCount: integer("click_count").notNull().default(0),
    purchaseCount: integer("purchase_count").notNull().default(0),

    computedAt: timestamp("computed_at").defaultNow().notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("tag_insights_category_tag_unique").on(table.category, table.tag),
    index("tag_insights_tag_idx").on(table.tag),
    index("tag_insights_category_idx").on(table.category),
    index("tag_insights_computed_idx").on(table.computedAt),
  ]
)

