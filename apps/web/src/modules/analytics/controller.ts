import { NextResponse } from "next/server"
import { analyticsService } from "./service"

export const analyticsController = {
  async getSnapshot() {
    const snapshot = await analyticsService.getSnapshot()
    return NextResponse.json(snapshot)
  },
}
