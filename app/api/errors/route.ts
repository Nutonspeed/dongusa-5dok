import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from "next/server"

interface ErrorReport {
  message: string
  stack?: string
  url: string
  userAgent: string
  timestamp: string
  userId?: string
  severity: "low" | "medium" | "high" | "critical"
}

const errorStore: ErrorReport[] = []

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorReport = await request.json()

    // Add timestamp if not provided
    if (!errorData.timestamp) {
      errorData.timestamp = new Date().toISOString()
    }

    // Store error (in production, this would go to a proper error tracking service)
    errorStore.push(errorData)

    // Log critical errors immediately
    if (errorData.severity === "critical") {
      logger.error("CRITICAL ERROR:", errorData)

      // In production, you might want to send alerts here
      // await sendSlackAlert(errorData)
      // await sendEmailAlert(errorData)
    }

    return NextResponse.json({
      success: true,
      message: "Error reported successfully",
    })
  } catch (error) {
    logger.error("Error processing error report:", error)
    return NextResponse.json({ error: "Failed to process error report" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get("severity")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let filteredErrors = errorStore

    if (severity) {
      filteredErrors = errorStore.filter((error) => error.severity === severity)
    }

    // Return most recent errors first
    const recentErrors = filteredErrors
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      errors: recentErrors,
      total: filteredErrors.length,
    })
  } catch (error) {
    logger.error("Error fetching errors:", error)
    return NextResponse.json({ error: "Failed to fetch errors" }, { status: 500 })
  }
}
