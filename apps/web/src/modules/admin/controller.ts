import { NextRequest, NextResponse } from "next/server"
import { adminService } from "./service"
import { validateProductImagesPatchInput, validateTagUpdateInput } from "./schema"
import type { AdminProductImagesPatchInput, AdminTagUpdateInput } from "./types"

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

  async patchProductImages(request: NextRequest, productId: string) {
    const input = (await request.json()) as AdminProductImagesPatchInput
    validateProductImagesPatchInput(input)
    const product = await adminService.patchProductImages(productId, input)
    return NextResponse.json({
      success: true,
      productId,
      images: product?.images ?? [],
    })
  },
}
