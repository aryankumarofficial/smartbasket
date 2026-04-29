import { NextRequest, NextResponse } from "next/server"
import { productsController } from "@/src/modules/products/controller"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    return productsController.getById(id)
  } catch (error) {
    console.error("GET /api/products/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    return productsController.update(request, id)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update product"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
