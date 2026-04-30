import { config as loadEnv } from "dotenv"
import * as path from "path"

import { seedAdmins } from "./seed-admins"
import { seedEvents } from "./seed-events"
import { seedProducts } from "./seed-products"
import { seedUsers } from "./seed-users"

loadEnv({ path: path.resolve(process.cwd(), ".env"), override: false })

function assertSeedSafety() {
  const isProduction = process.env.NODE_ENV === "production"
  const allowProdSeed = process.env.ALLOW_PRODUCTION_SEED === "true"
  if (isProduction && !allowProdSeed) {
    throw new Error(
      "Refusing to seed in production. Set ALLOW_PRODUCTION_SEED=true to override intentionally."
    )
  }
}

async function run() {
  assertSeedSafety()
  console.log("🌱 SmartBasket seed started")

  const admins = await seedAdmins()
  console.log(`✅ admins seeded/enforced: ${admins.length}`)

  const users = await seedUsers()
  console.log(`✅ users ready: ${users.length}`)

  const products = await seedProducts()
  console.log(`✅ products inserted: ${products.length}`)

  await seedEvents()
  console.log("✅ behavioral events + profiles + recommendations seeded")

  console.log("🎉 Seed completed")
}

run().catch((error) => {
  console.error("❌ Seed failed")
  console.error(error)
  process.exit(1)
})
