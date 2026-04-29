import type { AuthContext } from "./types"

export function requireAdmin(auth: AuthContext) {
  if (auth.role !== "admin") {
    throw new Error("Admin role required")
  }
}
