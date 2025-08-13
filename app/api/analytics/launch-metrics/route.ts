import { type NextRequest, NextResponse } from "next/server"

interface LaunchMetrics {
  timestamp: string
  activeUsers: number
  pageViews: number
  conversionRate: number
  revenue: number
  errorRate: number
  averageResponseTime: number
  customerSatisfaction: number
}

// In-memory storage for demo (use database in production)
const launchMetrics: LaunchMetrics[] = []

export async function POST(request: NextRequest) {
  try {
    const metrics: LaunchMetrics = await request.json()

    // Validate required fields
    if (!metrics.timestamp) {
      return NextResponse.json({ error: "Missing required field: timestamp" }, { status: 400 })
    }

    // Store metrics
    launchMetrics.push(metrics)

    // Keep only last 1000 entries to prevent memory issues
    if (launchMetrics.length > 1000) {
      launchMetrics.splice(0, launchMetrics.length - 1000)
    }

    return NextResponse.json({
      success: true,
      message: "Launch metrics stored successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to store launch metrics" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = Number.parseInt(searchParams.get("hours") || "24")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)

    const recentMetrics = launchMetrics
      .filter((metric) => new Date(metric.timestamp) >= cutoffTime)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      metrics: recentMetrics,
      total: recentMetrics.length,
      period: `${hours} hours`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch launch metrics" }, { status: 500 })
  }
}
