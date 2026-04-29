import { NextRequest, NextResponse } from "next/server"
import { requireAdminRequest } from "@/src/lib/auth/admin-guard"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminRequest(request)
    const { id } = await params
    const { adminController } = await import("@/src/modules/admin/controller")
    return adminController.updateProductTags(request, id)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update product tags"
    const status = message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
