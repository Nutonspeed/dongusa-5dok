import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "1h"

    // Mock data - in production, get from database
    const pageViews = Math.floor(Math.random() * 1000) + 200

    return NextResponse.json({ pageViews, period })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get page views" }, { status: 500 })
  }
}
