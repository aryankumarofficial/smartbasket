import { eq } from "drizzle-orm"
import { db } from "../client.js"
import { productEmbeddings } from "../schema/product-embeddings.js"
import { userEmbeddings } from "../schema/user-embeddings.js"

export const upsertProductEmbedding = async (data: {
  productId: string
  embedding: number[]
  model: string
  dimensions: number
  inputText?: string
  metadata?: Record<string, unknown>
}) => {
  const existing = await db.query.productEmbeddings.findFirst({
    where: eq(productEmbeddings.productId, data.productId),
  })

  if (existing) {
    await db
      .update(productEmbeddings)
      .set({
        embedding: data.embedding,
        model: data.model,
        dimensions: data.dimensions,
        inputText: data.inputText,
        metadata: data.metadata,
        version: (existing.version ?? 0) + 1,
      })
      .where(eq(productEmbeddings.productId, data.productId))
    return
  }

  await db.insert(productEmbeddings).values(data)
}

export const getProductEmbedding = async (productId: string) => {
  return db.query.productEmbeddings.findFirst({
    where: eq(productEmbeddings.productId, productId),
  })
}

export const getAllProductEmbeddings = async () => {
  return db.query.productEmbeddings.findMany()
}

export const upsertUserEmbedding = async (data: {
  userId: string
  embedding: number[]
  model: string
  dimensions: number
  inputSummary?: string
  metadata?: Record<string, unknown>
}) => {
  const existing = await db.query.userEmbeddings.findFirst({
    where: eq(userEmbeddings.userId, data.userId),
  })

  if (existing) {
    await db
      .update(userEmbeddings)
      .set({
        embedding: data.embedding,
        model: data.model,
        dimensions: data.dimensions,
        inputSummary: data.inputSummary,
        metadata: data.metadata,
        version: (existing.version ?? 0) + 1,
      })
      .where(eq(userEmbeddings.userId, data.userId))
    return
  }

  await db.insert(userEmbeddings).values(data)
}

export const getUserEmbedding = async (userId: string) => {
  return db.query.userEmbeddings.findFirst({
    where: eq(userEmbeddings.userId, userId),
  })
}
