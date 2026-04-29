import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema/index.js"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(`DATABASE URL is not set`)
}

const client = postgres(connectionString, {
  max: 10,
})

const _db = drizzle(client, { schema })

type DB = typeof _db

declare global {
  // eslint-disable-next-line no-var
  var _db: DB | undefined
}

export const db: DB = global._db ?? _db

if (process.env.NODE_ENV !== "production") {
  global._db = db
}
