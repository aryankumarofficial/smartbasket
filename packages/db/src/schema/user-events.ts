import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { users } from "./users.js"
import { products } from "./products.js"
import { index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const userEvents = pgTable(
  "user_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "cascade",
    }),
    eventType: text("event_type").notNull(),

    metadata: jsonb("metadata").$type<Record<string, any>>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("user_events_user_idx").on(table.userId),
    index("user_events_product_idx").on(table.productId),
    index("user_events_type_idx").on(table.eventType),
    index("user_events_created_idx").on(table.createdAt),
  ]
)

export const userEventsRelations = relations(userEvents, ({ one }) => ({
  user: one(users, {
    fields: [userEvents.userId],
    references: [users.id],
  }),

  product: one(products, {
    fields: [userEvents.productId],
    references: [products.id],
  }),
}))
