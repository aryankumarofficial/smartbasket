import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema/index.js"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(`DATABASE URL is not set`)
}

declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof drizzle> | undefined
}

const client = postgres(connectionString, {
  max: 10,
})

export const db = global._db ?? drizzle(client, { schema })

if (process.env.NODE_ENV !== "production") {
  global._db = db
}
