import { NextRequest, NextResponse } from "next/server"

import { productsController } from "@/src/modules/products/controller"
import { productsService } from "@/src/modules/products/service"
import { requireAdminRequest } from "@/src/lib/auth/admin-guard"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRequest(request)
    const { id } = await params
    return productsController.getById(id)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch product"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRequest(request)
    const { id } = await params
    return productsController.update(request, id)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRequest(request)
    const { id } = await params
    const deleted = await productsService.remove(id)
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, id: deleted.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
