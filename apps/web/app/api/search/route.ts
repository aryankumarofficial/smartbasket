import { NextRequest, NextResponse } from "next/server"
import { searchService } from "@/lib/services/search.service"
import { eventTrackingService } from "@/lib/services/event-tracking.service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const query = searchParams.get("q") ?? undefined
    const category = searchParams.get("category") ?? undefined
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined
    const occasion = searchParams.get("occasion") ?? undefined
    const recipientType =
      searchParams.get("recipientType") ?? undefined
    const tags = searchParams.get("tags")
      ? searchParams.get("tags")!.split(",")
      : undefined
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : 20
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 0
    const sortBy = searchParams.get("sortBy") as
      | "price_asc"
      | "price_desc"
      | "rating"
      | "newest"
      | "relevance"
      | undefined

    const result = await searchService.search({
      query,
      category,
      minPrice,
      maxPrice,
      occasion,
      recipientType,
      tags,
      limit,
      offset,
      sortBy,
    })

    // Log search event asynchronously
    if (query) {
      const userId = searchParams.get("userId") ?? undefined
      const sessionId = searchParams.get("sessionId") ?? undefined
      eventTrackingService
        .ingestEvent({
          eventType: "search",
          userId,
          sessionId,
          metadata: {
            query,
            filters: { category, minPrice, maxPrice, occasion },
            resultCount: result.total,
          },
        })
        .catch(() => {
          // Non-critical
        })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/search error:", error)
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}
