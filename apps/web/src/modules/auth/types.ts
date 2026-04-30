export interface AuthContext {
  userId: string
  role: "user" | "admin" | "super_admin"
}
