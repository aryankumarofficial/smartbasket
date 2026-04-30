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

export const searchLogs = pgTable(
  "search_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    sessionId: text("session_id"),
    query: text("query").notNull(),
    filters: jsonb("filters").$type<Record<string, unknown>>(),
    resultCount: integer("result_count"),
    selectedProductId: uuid("selected_product_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("search_logs_user_idx").on(table.userId),
    index("search_logs_session_idx").on(table.sessionId),
    index("search_logs_query_idx").on(table.query),
    index("search_logs_created_idx").on(table.createdAt),
  ]
)

export const searchLogsRelations = relations(searchLogs, ({ one }) => ({
  user: one(users, {
    fields: [searchLogs.userId],
    references: [users.id],
  }),
}))
