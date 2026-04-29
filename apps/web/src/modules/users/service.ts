import { usersRepository } from "./repository"
import { validateUserId } from "./schema"

export const usersService = {
  async getById(userId: string) {
    validateUserId(userId)
    return usersRepository.getById(userId)
  },
}
