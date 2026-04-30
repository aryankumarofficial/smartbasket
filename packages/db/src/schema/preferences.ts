import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { users } from "./users"
import { relations } from "drizzle-orm"

export const preferences = pgTable(
  "preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    interests: jsonb("interests").$type<string[]>(), // ["gadgets","books"]

    priceRange: jsonb("price_range").$type<{
      min?: number
      max?: number
    }>(),

    occasions: jsonb("occasions").$type<string[]>(),

    recipientBias: text("recipient_bias"), // "friend", "partner", etc.

    embedding: jsonb("embedding").$type<number[]>(), // optional vector fallback

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("preferences_user_idx").on(table.userId)]
)

export const preferencesRelations = relations(preferences, ({ one }) => ({
  user: one(users, {
    fields: [preferences.userId],
    references: [users.id],
  }),
}))
