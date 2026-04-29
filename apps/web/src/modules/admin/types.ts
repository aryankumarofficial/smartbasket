import type { StructuredTag } from "@/src/modules/tagging/types"

export interface AdminTagUpdateInput {
  manualTags: StructuredTag[]
}

export type AdminImagesPatchMode = "reorder" | "append" | "remove"

export interface AdminProductImagesPatchInput {
  mode: AdminImagesPatchMode
  images: string[]
}
