import { type NextRequest, NextResponse } from "next/server"
import { enhancedPaymentService } from "@/lib/payment-service-enhanced"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { orderId, method, amount, paymentData } = await request.json()

    if (!orderId || !method || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await enhancedPaymentService.processPayment(orderId, method, amount, paymentData)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error("Payment processing API error:", error)
    return NextResponse.json(
      {
        error: "Payment processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
