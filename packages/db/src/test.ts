import { db } from "./client.js"
import { users } from "./schema/users.js"

async function test() {
  const allUsers = await db.select().from(users)
  console.log(allUsers)
}

test()
  .catch((e) => console.log(e))
  .finally(() => {
    process.exit()
  })
