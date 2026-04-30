import { relations } from "drizzle-orm"
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { userEvents } from "./user-events"
import { carts } from "./carts"
import { orders } from "./orders"
import { preferences } from "./preferences"
import { productViews } from "./product-views"
import { cartEvents } from "./cart-events"
import { wishlistEvents } from "./wishlist-events"
import { searchLogs } from "./search-logs"
import { userSessions } from "./user-sessions"
import { userProfiles } from "./user-profiles"
import { userEmbeddings } from "./user-embeddings"
import { recommendationCache } from "./recommendation-cache"

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
  productViews: many(productViews),
  cartEvents: many(cartEvents),
  wishlistEvents: many(wishlistEvents),
  searchLogs: many(searchLogs),
  sessions: many(userSessions),
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  embeddings: one(userEmbeddings, {
    fields: [users.id],
    references: [userEmbeddings.userId],
  }),
  recommendationCache: many(recommendationCache),
}))
