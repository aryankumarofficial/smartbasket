import { relations } from "drizzle-orm"
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { users } from "./users.js"
import { products } from "./products.js"

export const wishlistEvents = pgTable(
  "wishlist_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id"),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // add, remove
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("wishlist_events_user_idx").on(table.userId),
    index("wishlist_events_product_idx").on(table.productId),
    index("wishlist_events_action_idx").on(table.action),
    index("wishlist_events_created_idx").on(table.createdAt),
  ]
)

export const wishlistEventsRelations = relations(
  wishlistEvents,
  ({ one }) => ({
    user: one(users, {
      fields: [wishlistEvents.userId],
      references: [users.id],
    }),
    product: one(products, {
      fields: [wishlistEvents.productId],
      references: [products.id],
    }),
  })
)
