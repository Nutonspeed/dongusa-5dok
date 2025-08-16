import { type NextRequest, NextResponse } from "next/server"
import { enhancedPaymentService } from "@/lib/payment-service-enhanced"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { transactionId, verificationData } = await request.json()

    if (!transactionId || !verificationData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const isValid = await enhancedPaymentService.verifyPayment(transactionId, verificationData)

    return NextResponse.json({
      success: true,
      verified: isValid,
    })
  } catch (error) {
    logger.error("Payment verification API error:", error)
    return NextResponse.json(
      {
        error: "Payment verification failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
