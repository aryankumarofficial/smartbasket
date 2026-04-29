import { NextRequest, NextResponse } from "next/server"
import { requireAdminRequest } from "@/src/lib/auth/admin-guard"

export async function GET(request: NextRequest) {
  try {
    // Enforce RBAC (admin only)
    await requireAdminRequest(request)

    const includeJobs = request.nextUrl.searchParams.get("includeJobs") === "1"

    const { analyticsController } = await import(
      "@/src/modules/analytics/controller"
    )
    const snapshotResponse = await analyticsController.getSnapshot()
    const snapshot = (await snapshotResponse.json()) as Record<string, unknown>

    if (!includeJobs) {
      return NextResponse.json(snapshot)
    }

    try {
      // Start workers so queue status is meaningful in dev (optional)
      const { startScheduler, getJobStatus } = await import(
        "@/lib/workers/scheduler"
      )
      startScheduler()
      const jobs = await getJobStatus()
      return NextResponse.json({ ...snapshot, jobs })
    } catch (err) {
      const jobsError = err instanceof Error ? err.message : "Failed to fetch job status"
      return NextResponse.json({ ...snapshot, jobsError })
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch analytics"
    const status = message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminRequest(request)
    if (!process.env.REDIS_URL) {
      return NextResponse.json(
        { error: "REDIS_URL is not configured" },
        { status: 503 }
      )
    }

    const { startScheduler } = await import("@/lib/workers/scheduler")
    const { enqueueTagInsightsRefresh } = await import("@/lib/workers/queues")
    startScheduler()
    const job = await enqueueTagInsightsRefresh({ reason: "admin_refresh" })
    return NextResponse.json({
      success: true,
      jobId: job.id,
      queue: "tag-insights-refresh",
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to refresh analytics"
    const status = message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
