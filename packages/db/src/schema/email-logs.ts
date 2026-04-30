import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { users } from "./users"

export const emailLogs = pgTable(
  "email_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    recipientEmail: text("recipient_email").notNull(),
    emailType: text("email_type").notNull(),
    status: text("status").notNull().default("pending"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("email_logs_user_idx").on(table.userId),
    index("email_logs_status_idx").on(table.status),
    index("email_logs_type_idx").on(table.emailType),
    index("email_logs_created_idx").on(table.createdAt),
  ]
)
