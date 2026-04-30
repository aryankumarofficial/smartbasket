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
import { users } from "./users"
import { products } from "./products"

export const cartEvents = pgTable(
  "cart_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id"),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // add, remove, update_quantity
    quantity: integer("quantity").notNull().default(1),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("cart_events_user_idx").on(table.userId),
    index("cart_events_product_idx").on(table.productId),
    index("cart_events_action_idx").on(table.action),
    index("cart_events_created_idx").on(table.createdAt),
  ]
)

export const cartEventsRelations = relations(cartEvents, ({ one }) => ({
  user: one(users, {
    fields: [cartEvents.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartEvents.productId],
    references: [products.id],
  }),
}))
