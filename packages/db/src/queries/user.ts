import { eq } from "drizzle-orm"
import { db } from "../client"
import { users } from "../schema/users"

export const getUserByEmail = async (email: string) => {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  })
}

export const getUserById = async (id: string) => {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  })
}

export const createUser = async (data: {
  email: string
  name: string
  passwordHash: string
}) => {
  const [user] = await db.insert(users).values(data).returning()
  return user
}
