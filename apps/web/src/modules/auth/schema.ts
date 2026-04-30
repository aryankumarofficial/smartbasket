import type { AuthContext } from "./types"

export function requireAdmin(auth: AuthContext) {
  if (auth.role !== "admin" && auth.role !== "super_admin") {
    throw new Error("Admin role required")
  }
}
