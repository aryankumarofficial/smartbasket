import type { AuthContext } from "./types"

export const authService = {
  assertAuthenticated(auth: AuthContext | null): asserts auth is AuthContext {
    if (!auth) {
      throw new Error("Unauthorized")
    }
  },
}
