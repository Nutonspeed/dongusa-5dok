import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()

    // Log error to console (in production, send to error tracking service)
    console.error("Client Error Report:", {
      ...errorData,
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      timestamp: new Date().toISOString(),
    })

    // In production, you would send this to services like:
    // - Sentry: Sentry.captureException(new Error(errorData.message), { extra: errorData })
    // - LogRocket: LogRocket.captureException(new Error(errorData.message))
    // - DataDog: logger.error(errorData.message, errorData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging client error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
