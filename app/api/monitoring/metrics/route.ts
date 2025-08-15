import { type NextRequest, NextResponse } from "next/server"
import { USE_SUPABASE } from "@/lib/runtime"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = (searchParams.get("range") as "1h" | "24h" | "7d") || "24h"

    if (!USE_SUPABASE) {
      return NextResponse.json(
        { success: false, error: "Monitoring disabled" },
        { status: 503 },
      )
    }
    const { monitoringService } = await import("@/lib/monitoring-service")
    const metrics = await monitoringService.collectMetrics()
    const logs = await monitoringService.aggregateLogs(timeRange)

    return NextResponse.json({
      success: true,
      data: {
        current_metrics: metrics,
        log_analysis: logs,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error collecting metrics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to collect metrics",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    if (!USE_SUPABASE) {
      return NextResponse.json(
        { success: false, error: "Monitoring disabled" },
        { status: 503 },
      )
    }
    const { monitoringService } = await import("@/lib/monitoring-service")
    switch (action) {
      case "run_maintenance":
        await monitoringService.runMaintenanceTasks()
        return NextResponse.json({
          success: true,
          message: "Maintenance tasks initiated",
        })

      case "health_check":
        const healthStatus = await monitoringService.performHealthCheck()
        return NextResponse.json({
          success: true,
          data: healthStatus,
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Error processing monitoring request:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
      },
      { status: 500 },
    )
  }
}
