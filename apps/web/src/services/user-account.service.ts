import { apiFetch } from "@/src/lib/api"
import type { AccountResponse } from "@/src/types/user-system"

export function getUserAccount() {
  return apiFetch<AccountResponse>("/api/user/account")
}

export function updateUserAccount(input: { name: string }) {
  return apiFetch<AccountResponse>("/api/user/account", {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}
