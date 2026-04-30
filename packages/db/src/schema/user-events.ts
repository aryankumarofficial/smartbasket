import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { users } from "./users"
import { products } from "./products"
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
    sessionId: text("session_id"),
    anonymousId: text("anonymous_id"),
    eventId: text("event_id"),
    eventType: text("event_type").notNull(),
    source: text("source"),
    occurredAt: timestamp("occurred_at").defaultNow().notNull(),

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
    index("user_events_session_idx").on(table.sessionId),
    index("user_events_event_id_idx").on(table.eventId),
    index("user_events_type_idx").on(table.eventType),
    index("user_events_occurred_idx").on(table.occurredAt),
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
