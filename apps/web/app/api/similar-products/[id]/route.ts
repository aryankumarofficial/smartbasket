import { NextRequest, NextResponse } from "next/server"
import { recommendationService } from "@/lib/services/recommendation.service"

/**
 * Compatibility alias for storefronts expecting `/api/similar-products/:id`.
 * Same behavior as `GET /api/recommendations/similar/[productId]`.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const limit = request.nextUrl.searchParams.get("limit")
      ? Number(request.nextUrl.searchParams.get("limit"))
      : 10

    const recommendations = await recommendationService.getSimilarProducts(id, limit)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("GET /api/similar-products/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch similar products" },
      { status: 500 }
    )
  }
}
