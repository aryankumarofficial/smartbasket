export function validateUserId(userId: string) {
  if (!userId) {
    throw new Error("userId is required")
  }
}
