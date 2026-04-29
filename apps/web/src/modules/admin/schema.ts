import type { AdminTagUpdateInput } from "./types"

export function validateTagUpdateInput(input: AdminTagUpdateInput) {
  if (!Array.isArray(input.manualTags)) {
    throw new Error("manualTags must be an array")
  }
}
