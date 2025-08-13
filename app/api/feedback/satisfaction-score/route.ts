import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "1h"

    // Mock data - in production, calculate from feedback data
    const satisfactionScore = Math.random() * 1.5 + 3.5 // 3.5-5.0

    return NextResponse.json({ satisfactionScore: Number(satisfactionScore.toFixed(1)), period })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get satisfaction score" }, { status: 500 })
  }
}
