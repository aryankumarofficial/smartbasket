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

export interface CachedRecommendation {
  productId: string
  score: number
  reason: string
}

export const recommendationCache = pgTable(
  "recommendation_cache",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    strategy: text("strategy").notNull(), // content_based, collaborative, hybrid, popular, rule_based
    recommendations: jsonb("recommendations")
      .$type<CachedRecommendation[]>()
      .notNull(),
    context: jsonb("context").$type<Record<string, unknown>>(), // filters/params used
    score: real("score"), // confidence score of this batch
    version: integer("version").default(1),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("rec_cache_user_idx").on(table.userId),
    index("rec_cache_strategy_idx").on(table.strategy),
    index("rec_cache_expires_idx").on(table.expiresAt),
    index("rec_cache_user_strategy_idx").on(table.userId, table.strategy),
  ]
)

export const recommendationCacheRelations = relations(
  recommendationCache,
  ({ one }) => ({
    user: one(users, {
      fields: [recommendationCache.userId],
      references: [users.id],
    }),
  })
)
