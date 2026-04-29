import { NextRequest, NextResponse } from "next/server"
import { recommendationService } from "@/lib/services/recommendation.service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : 10

    const recommendations =
      await recommendationService.getSimilarProducts(productId, limit)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error(
      "GET /api/recommendations/similar/[productId] error:",
      error
    )
    return NextResponse.json(
      { error: "Failed to fetch similar products" },
      { status: 500 }
    )
  }
}
