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
import { products } from "./products.js"
import { vector } from "./vector.js"

export const productEmbeddings = pgTable(
  "product_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .unique()
      .references(() => products.id, { onDelete: "cascade" }),
    embedding: vector("embedding", 384).notNull(),
    model: text("model").notNull(), // e.g. "sentence-transformers/all-MiniLM-L6-v2"
    dimensions: integer("dimensions").notNull(),
    inputText: text("input_text"), // the text used to generate the embedding
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    version: integer("version").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("product_embeddings_product_idx").on(table.productId),
    index("product_embeddings_model_idx").on(table.model),
  ]
)

export const productEmbeddingsRelations = relations(
  productEmbeddings,
  ({ one }) => ({
    product: one(products, {
      fields: [productEmbeddings.productId],
      references: [products.id],
    }),
  })
)
