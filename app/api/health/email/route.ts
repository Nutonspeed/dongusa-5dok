import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test email service configuration
    const emailConfig = {
      provider: process.env.EMAIL_PROVIDER || "sendgrid",
      apiKey: process.env.SENDGRID_API_KEY ? "configured" : "missing",
    }

    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("Email service not configured")
    }

    return NextResponse.json({
      status: "ok",
      config: emailConfig,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Email service check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
