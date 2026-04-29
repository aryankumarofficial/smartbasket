import type { AdminProductImagesPatchInput, AdminTagUpdateInput } from "./types"

export function validateTagUpdateInput(input: AdminTagUpdateInput) {
  if (!Array.isArray(input.manualTags)) {
    throw new Error("manualTags must be an array")
  }
}

export function validateProductImagesPatchInput(
  input: AdminProductImagesPatchInput
) {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid payload")
  }
  if (!["reorder", "append", "remove"].includes(input.mode)) {
    throw new Error("mode must be one of: reorder, append, remove")
  }
  if (!Array.isArray(input.images)) {
    throw new Error("images must be an array")
  }
  for (const url of input.images) {
    if (typeof url !== "string" || !url.trim()) {
      throw new Error("images must be an array of non-empty strings")
    }
  }
}
