import { NextRequest, NextResponse } from "next/server"
import { adminController } from "@/src/modules/admin/controller"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    return adminController.updateProductTags(request, id)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update product tags"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
