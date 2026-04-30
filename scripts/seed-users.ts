import { hash } from "bcryptjs"
import { eq, inArray } from "drizzle-orm"

import { db } from "@workspace/db/client"
import { carts, preferences, users } from "@workspace/db/schema"
import {
  buildEmail,
  buildName,
  pickManyUnique,
  randomDateWithinDays,
  randomInt,
} from "../lib/faker"

export interface SeedUserResult {
  id: string
  email: string
  name: string
  createdAt: Date
}

const INTERESTS = [
  "tech",
  "fashion",
  "fitness",
  "books",
  "home-decor",
  "travel",
  "gaming",
  "coffee",
]

const OCCASIONS = [
  "birthday",
  "anniversary",
  "wedding",
  "housewarming",
  "festive",
  "graduation",
]

const RECIPIENT_BIAS = ["friend", "partner", "parent", "sibling", "colleague"]

export async function seedUsers(): Promise<SeedUserResult[]> {
  const targetCount = randomInt(30, 45)
  const candidates = Array.from({ length: targetCount }, (_, i) => {
    const name = buildName()
    return {
      name,
      email: buildEmail(name, i + 1),
      createdAt: randomDateWithinDays(240),
    }
  })

  const existing = await db
    .select({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt })
    .from(users)
    .where(inArray(users.email, candidates.map((c) => c.email)))
  const existingByEmail = new Map(existing.map((row) => [row.email, row]))

  const createdUsers: SeedUserResult[] = []
  for (const candidate of candidates) {
    const existingRow = existingByEmail.get(candidate.email)
    if (existingRow) {
      createdUsers.push({
        id: existingRow.id,
        email: existingRow.email,
        name: existingRow.name,
        createdAt: existingRow.createdAt,
      })
      continue
    }

    const passwordHash = await hash(`User@${randomInt(1000, 9999)}`, 10)
    const [inserted] = await db
      .insert(users)
      .values({
        email: candidate.email,
        name: candidate.name,
        role: "user",
        passwordHash,
        createdAt: candidate.createdAt,
        updatedAt: candidate.createdAt,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })

    if (!inserted) continue
    createdUsers.push(inserted)
  }

  const userIds = createdUsers.map((u) => u.id)
  if (userIds.length === 0) return createdUsers

  const existingCarts = await db
    .select({ userId: carts.userId })
    .from(carts)
    .where(inArray(carts.userId, userIds))
  const cartSet = new Set(existingCarts.map((c) => c.userId))

  const missingCartRows = userIds
    .filter((userId) => !cartSet.has(userId))
    .map((userId) => ({ userId }))
  if (missingCartRows.length > 0) {
    await db.insert(carts).values(missingCartRows)
  }

  const existingPrefs = await db
    .select({ userId: preferences.userId })
    .from(preferences)
    .where(inArray(preferences.userId, userIds))
  const prefSet = new Set(existingPrefs.map((p) => p.userId))

  for (const user of createdUsers) {
    if (prefSet.has(user.id)) continue
    await db.insert(preferences).values({
      userId: user.id,
      interests: pickManyUnique(INTERESTS, randomInt(2, 4)),
      occasions: pickManyUnique(OCCASIONS, randomInt(1, 3)),
      recipientBias: RECIPIENT_BIAS[randomInt(0, RECIPIENT_BIAS.length - 1)],
      priceRange: { min: randomInt(300, 1200), max: randomInt(1500, 12000) },
    })
  }

  // Keep only non-admin users for event simulation.
  const regularUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "user"))

  return regularUsers
}
