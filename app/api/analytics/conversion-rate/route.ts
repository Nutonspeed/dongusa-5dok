import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "1h"

    // Mock data - in production, calculate from actual conversion data
    const conversionRate = Math.random() * 3 + 2 // 2-5%

    return NextResponse.json({ conversionRate: Number(conversionRate.toFixed(2)), period })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get conversion rate" }, { status: 500 })
  }
}
