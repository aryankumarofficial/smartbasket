import { create } from "zustand"

import type { AuthUser } from "@/src/types/auth"

export interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  setAuth: (payload: { accessToken: string; user: AuthUser }) => void
  clearAuth: () => void
}

/**
 * Auth lives in memory only (no persist). Refresh cookie is httpOnly on the server.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: ({ accessToken, user }) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
}))
