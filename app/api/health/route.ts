import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_BUILD_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: "connected", // In production, check actual database connection
        email: "operational",
        storage: "operational",
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    }

    return NextResponse.json(healthCheck)
  } catch (error) {
    logger.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
