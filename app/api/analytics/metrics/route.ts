import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  userId?: string
  sessionId?: string
}

// In-memory storage for demo (use database in production)
const metrics: PerformanceMetric[] = []

export async function POST(request: NextRequest) {
  try {
    const metricData: PerformanceMetric = await request.json()

    // Validate required fields
    if (!metricData.name || metricData.value === undefined) {
      return NextResponse.json({ error: "Missing required fields: name, value" }, { status: 400 })
    }

    // Add timestamp if not provided
    if (!metricData.timestamp) {
      metricData.timestamp = new Date().toISOString()
    }

    // Store metric
    metrics.push(metricData)

    // Log slow performance metrics
    if (metricData.name.includes("load_time") && metricData.value > 2000) {
      logger.warn("Slow performance detected:", metricData)
    }

    return NextResponse.json({
      success: true,
      message: "Metric recorded successfully",
    })
  } catch (error) {
    logger.error("Error recording performance metric:", error)
    return NextResponse.json({ error: "Failed to record metric" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    let filteredMetrics = metrics

    if (name) {
      filteredMetrics = filteredMetrics.filter((metric) => metric.name === name)
    }

    // Return most recent metrics first
    const recentMetrics = filteredMetrics
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    // Calculate averages for performance metrics
    const averages: Record<string, number> = {}
    const metricGroups = recentMetrics.reduce(
      (groups, metric) => {
        if (!groups[metric.name]) {
          groups[metric.name] = []
        }
        groups[metric.name].push(metric.value)
        return groups
      },
      {} as Record<string, number[]>,
    )

    Object.keys(metricGroups).forEach((metricName) => {
      const values = metricGroups[metricName]
      averages[metricName] = values.reduce((sum, value) => sum + value, 0) / values.length
    })

    return NextResponse.json({
      metrics: recentMetrics,
      averages,
      total: filteredMetrics.length,
    })
  } catch (error) {
    logger.error("Error fetching performance metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
