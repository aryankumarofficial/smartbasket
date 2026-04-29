import { NextRequest, NextResponse } from "next/server"
import { taggingService } from "./service"
import type { StructuredTag } from "./types"

export const taggingController = {
  async updateManualTags(
    request: NextRequest,
    productId: string
  ): Promise<NextResponse> {
    const body = (await request.json()) as { manualTags: StructuredTag[] }
    const updated = await taggingService.saveManualTags(
      productId,
      body.manualTags ?? []
    )

    return NextResponse.json({
      success: true,
      productId,
      manualTags: updated?.manualTags ?? [],
      finalTags: updated?.finalTags ?? [],
    })
  },
}
