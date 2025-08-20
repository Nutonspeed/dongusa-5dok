import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from "next/server"
import { enhancedBillDatabase } from "@/lib/enhanced-bill-database"
import { notifications } from "@/lib/notifications"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { paymentAmount, paymentMethod } = await request.json()

    if (typeof paymentAmount !== "number" || paymentAmount <= 0) {
      return NextResponse.json({ error: "invalid_payment_amount" }, { status: 400 })
    }

    const bill = await enhancedBillDatabase.getBill(id)
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    const updatedBill = await enhancedBillDatabase.updateBill(id, {
      status: "paid",
      paidAmount: paymentAmount,
      paymentMethod,
      paidAt: new Date().toISOString(),
    })

    if (!updatedBill) {
      return NextResponse.json({ error: "bill_update_failed" }, { status: 500 })
    }

    try {
      await notifications.notifyPaymentConfirmed({
        email: updatedBill.customerEmail,
        phone: updatedBill.customerPhone,
        orderId: updatedBill.billNumber || updatedBill.id,
        amount: paymentAmount,
      })
    } catch (notifyErr) {
      logger.warn("Payment updated but notifications failed:", notifyErr)
    }

    return NextResponse.json({
      success: true,
      bill: updatedBill,
      message: "Payment notification processed",
    })
  } catch (error) {
    logger.error("Error processing payment notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
