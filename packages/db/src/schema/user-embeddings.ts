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
import { users } from "./users.js"
import { vector } from "./vector.js"

export const userEmbeddings = pgTable(
  "user_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    embedding: vector("embedding", 384).notNull(),
    model: text("model").notNull(),
    dimensions: integer("dimensions").notNull(),
    inputSummary: text("input_summary"), // summary of user behavior used
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    version: integer("version").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("user_embeddings_user_idx").on(table.userId),
    index("user_embeddings_model_idx").on(table.model),
  ]
)

export const userEmbeddingsRelations = relations(
  userEmbeddings,
  ({ one }) => ({
    user: one(users, {
      fields: [userEmbeddings.userId],
      references: [users.id],
    }),
  })
)
