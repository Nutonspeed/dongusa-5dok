import { NextResponse } from "next/server"
import { monitoring } from "@/lib/monitoring-setup"
import { enhancedMockDatabase } from "@/lib/mock-database-enhanced"

export async function GET() {
  try {
    // Perform comprehensive health checks
    const healthChecks = await Promise.allSettled([
      monitoring.performHealthCheck("database", async () => {
        const health = await enhancedMockDatabase.healthCheck()
        return health
      }),

      monitoring.performHealthCheck("memory", async () => {
        const usage = process.memoryUsage()
        const usagePercent = usage.heapUsed / usage.heapTotal

        if (usagePercent > 0.9) {
          throw new Error("High memory usage")
        }

        return {
          heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
          usagePercent: Math.round(usagePercent * 100),
        }
      }),

      monitoring.performHealthCheck("disk_space", async () => {
        // In a real implementation, check disk space
        return { available: "10GB", used: "5GB", usagePercent: 50 }
      }),
    ])

    const results = healthChecks.map((result, index) => {
      const services = ["database", "memory", "disk_space"]
      return {
        service: services[index],
        status: result.status === "fulfilled" ? result.value.status : "unhealthy",
        details: result.status === "fulfilled" ? result.value.details : { error: result.reason?.message },
      }
    })

    const overallStatus = results.every((r) => r.status === "healthy")
      ? "healthy"
      : results.some((r) => r.status === "unhealthy")
        ? "unhealthy"
        : "degraded"

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      checks: results,
      dashboard: monitoring.getDashboardData(),
    }

    const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503

    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    monitoring.captureException(error as Error, { endpoint: "/api/health" })

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 503 },
    )
  }
}
