import { NextRequest, NextResponse } from "next/server"
import { productsController } from "@/src/modules/products/controller"

export async function GET(request: NextRequest) {
  try {
    return productsController.list(request)
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    return productsController.create(request)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
