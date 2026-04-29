import { getUserById } from "@workspace/db/queries/user"

export const usersRepository = {
  getById: getUserById,
}
