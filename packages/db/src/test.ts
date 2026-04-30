import { db } from "./client"
import { users } from "./schema/users"

async function test() {
  const allUsers = await db.select().from(users)
  console.log(allUsers)
}

test()
  .catch((e) => console.log(e))
  .finally(() => {
    process.exit()
  })
