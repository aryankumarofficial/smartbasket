import { relations } from "drizzle-orm"
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { userEvents } from "./user-events.js"
import { carts } from "./carts.js"
import { orders } from "./orders.js"
import { preferences } from "./preferences.js"

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("user"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_id_idx").on(table.id),
  ]
)

export const userRelations = relations(users, ({ many, one }) => ({
  events: many(userEvents),
  cart: one(carts, {
    fields: [users.id],
    references: [carts.userId],
  }),
  orders: many(orders),
  preferences: one(preferences, {
    fields: [users.id],
    references: [preferences.userId],
  }),
}))
