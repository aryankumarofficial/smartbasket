import { NextRequest, NextResponse } from "next/server"

import { productsController } from "@/src/modules/products/controller"
import { requireAdminRequest } from "@/src/lib/auth/admin-guard"

export async function GET(request: NextRequest) {
  try {
    await requireAdminRequest(request)
    return productsController.list(request)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list products"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminRequest(request)
    return productsController.create(request)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
