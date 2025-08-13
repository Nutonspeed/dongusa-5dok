import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "1h"

    // Mock data - in production, get from error tracking
    const errorRate = Math.random() * 2 + 0.5 // 0.5-2.5%

    return NextResponse.json({ errorRate: Number(errorRate.toFixed(2)), period })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get error rate" }, { status: 500 })
  }
}
