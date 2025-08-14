import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test payment service configuration
    const paymentConfig = {
      stripe: process.env.STRIPE_SECRET_KEY ? "configured" : "missing",
      promptpay: process.env.PROMPTPAY_ENABLED === "true" ? "enabled" : "disabled",
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Payment service not configured")
    }

    return NextResponse.json({
      status: "ok",
      config: paymentConfig,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Payment service check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
