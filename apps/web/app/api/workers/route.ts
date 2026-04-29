import { NextRequest, NextResponse } from "next/server"
import { getJobStatus, runJob } from "@/lib/workers/scheduler"

export async function GET() {
  try {
    const jobs = getJobStatus()
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("GET /api/workers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch job status" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobName } = (await request.json()) as {
      jobName: string
    }

    if (!jobName) {
      return NextResponse.json(
        { error: "jobName is required" },
        { status: 400 }
      )
    }

    const result = await runJob(jobName)

    return NextResponse.json({
      success: true,
      job: jobName,
      result,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error"
    console.error("POST /api/workers error:", error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
