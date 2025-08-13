import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "1h"

    // Mock data - in production, get from performance monitoring
    const averageResponseTime = Math.floor(Math.random() * 500) + 300 // 300-800ms

    return NextResponse.json({ averageResponseTime, period })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get response time" }, { status: 500 })
  }
}
