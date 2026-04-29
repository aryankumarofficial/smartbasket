import { NextRequest, NextResponse } from "next/server"
import { adminService } from "./service"
import { validateTagUpdateInput } from "./schema"
import type { AdminTagUpdateInput } from "./types"

export const adminController = {
  async updateProductTags(request: NextRequest, productId: string) {
    const input = (await request.json()) as AdminTagUpdateInput
    validateTagUpdateInput(input)
    const product = await adminService.updateProductTags(
      productId,
      input.manualTags
    )
    return NextResponse.json({
      success: true,
      productId,
      manualTags: product?.manualTags ?? [],
      aiTags: product?.aiTags ?? [],
      finalTags: product?.finalTags ?? [],
    })
  },
}
