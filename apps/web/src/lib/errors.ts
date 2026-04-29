import { ApiError } from "@/src/lib/api"

/** Stable message extraction for toasts, banners, and form-level errors. */
export function getUserFacingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Something went wrong. Please try again."
}
