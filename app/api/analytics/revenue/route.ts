import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "1h"

    // Mock data - in production, get from database
    const revenue = Math.floor(Math.random() * 50000) + 10000 // 10k-60k THB

    return NextResponse.json({ revenue, period })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get revenue" }, { status: 500 })
  }
}
