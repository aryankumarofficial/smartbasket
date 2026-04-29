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

export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: text("session_id").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    deviceType: text("device_type"), // mobile, desktop, tablet
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    startTime: timestamp("start_time").defaultNow().notNull(),
    endTime: timestamp("end_time"),
    lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_sessions_session_idx").on(table.sessionId),
    index("user_sessions_user_idx").on(table.userId),
    index("user_sessions_start_idx").on(table.startTime),
    index("user_sessions_last_activity_idx").on(table.lastActivityAt),
  ]
)

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}))
