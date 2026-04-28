import path from "path"
import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({
  path: [path.resolve(process.cwd(), "../..", ".env")],
  override: true,
})

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE URL is not set!")
}

export default defineConfig({
  out: "./.migrations",
  dialect: "postgresql",
  schema: "src/schema/index.ts",
  migrations: {
    prefix: "unix",
    table: "__drizzle_migrations__",
  },
  dbCredentials: {
    url: databaseUrl,
  },
})
