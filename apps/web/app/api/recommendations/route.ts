import { NextRequest, NextResponse } from "next/server"
import { recommendationService } from "@/lib/services/recommendation.service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : 20

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    const context: Record<string, unknown> = {}
    const occasion = searchParams.get("occasion")
    const recipientType = searchParams.get("recipientType")
    const category = searchParams.get("category")
    const realTime = searchParams.get("realTime") === "true"

    if (occasion) context.occasion = occasion
    if (recipientType) context.recipientType = recipientType
    if (category) context.category = category
    if (realTime) context.realTime = true

    const recommendations =
      await recommendationService.getRecommendations(
        userId,
        limit,
        Object.keys(context).length > 0 ? context : undefined
      )

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("GET /api/recommendations error:", error)
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    )
  }
}
