import { relations } from "drizzle-orm"
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { users } from "./users.js"
import { products } from "./products.js"

export const productViews = pgTable(
  "product_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    sessionId: text("session_id"),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    duration: integer("duration"), // time spent in seconds
    source: text("source"), // search, category, recommendation, direct
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_views_user_idx").on(table.userId),
    index("product_views_product_idx").on(table.productId),
    index("product_views_session_idx").on(table.sessionId),
    index("product_views_created_idx").on(table.createdAt),
  ]
)

export const productViewsRelations = relations(productViews, ({ one }) => ({
  user: one(users, {
    fields: [productViews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [productViews.productId],
    references: [products.id],
  }),
}))
