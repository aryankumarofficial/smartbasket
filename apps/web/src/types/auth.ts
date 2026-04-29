export type UserRole = "user" | "admin"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface RefreshResponse {
  accessToken: string
  user: AuthUser
}
