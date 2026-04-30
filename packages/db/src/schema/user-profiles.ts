import { relations } from "drizzle-orm"
import {
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { users } from "./users"

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    // Aggregated category affinities: { "electronics": 0.8, "books": 0.3 }
    categoryAffinities: jsonb("category_affinities").$type<
      Record<string, number>
    >(),

    // Price behavior
    avgOrderValue: real("avg_order_value"),
    preferredPriceRange: jsonb("preferred_price_range").$type<{
      min: number
      max: number
    }>(),

    // Engagement metrics
    totalViews: integer("total_views").default(0),
    totalPurchases: integer("total_purchases").default(0),
    totalSearches: integer("total_searches").default(0),
    totalCartAdds: integer("total_cart_adds").default(0),
    totalWishlistAdds: integer("total_wishlist_adds").default(0),

    // Behavioral tags derived from patterns
    behavioralTags: jsonb("behavioral_tags").$type<string[]>(),

    // Top occasion + recipient patterns
    topOccasions: jsonb("top_occasions").$type<
      { occasion: string; count: number }[]
    >(),
    topRecipients: jsonb("top_recipients").$type<
      { type: string; count: number }[]
    >(),

    // Segment classification
    segment: text("segment"), // new, casual, engaged, power_user, churning

    lastActiveAt: timestamp("last_active_at"),
    profileVersion: integer("profile_version").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("user_profiles_user_idx").on(table.userId),
    index("user_profiles_segment_idx").on(table.segment),
  ]
)

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}))
