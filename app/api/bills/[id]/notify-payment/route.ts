import { type NextRequest, NextResponse } from "next/server"
import { billDatabase } from "@/lib/enhanced-bill-database"

// Rate limiting for payment notifications
const notificationAttempts = new Map<string, number[]>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 60000 // 1 minute

function checkRateLimit(billId: string): boolean {
  const now = Date.now()
  const attempts = notificationAttempts.get(billId) || []

  // Remove old attempts outside the window
  const validAttempts = attempts.filter((time) => now - time < WINDOW_MS)

  if (validAttempts.length >= MAX_ATTEMPTS) {
    return false
  }

  validAttempts.push(now)
  notificationAttempts.set(billId, validAttempts)
  return true
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billId = params.id
    const { message, timestamp, source } = await request.json()

    if (!billId) {
      return NextResponse.json({ error: "Bill ID is required", code: "MISSING_BILL_ID" }, { status: 400 })
    }

    // Rate limiting check
    if (!checkRateLimit(billId)) {
      return NextResponse.json(
        {
          error: "Too many notification attempts",
          code: "RATE_LIMITED",
          message: "Please wait before sending another notification",
        },
        { status: 429 },
      )
    }

    // Validate message length
    if (message && typeof message === "string" && message.length > 500) {
      return NextResponse.json(
        {
          error: "Message too long",
          code: "MESSAGE_TOO_LONG",
          message: "Message must be 500 characters or less",
        },
        { status: 400 },
      )
    }

    // Check if bill exists
    const bill = await billDatabase.getBillById(billId)
    if (!bill) {
      return NextResponse.json({ error: "Bill not found", code: "BILL_NOT_FOUND" }, { status: 404 })
    }

    // Simulate notification processing
    // In a real app, this would send emails, SMS, or push notifications
    console.log(`Payment notification for bill ${billId}:`, {
      message,
      timestamp,
      source,
      customer: bill.customer.name,
      amount: bill.remainingBalance,
    })

    // Simulate potential failure for demo purposes
    if (Math.random() < 0.1) {
      // 10% chance of failure
      throw new Error("Notification service temporarily unavailable")
    }

    // Add notification to bill notes
    const updatedNotes = `${bill.notes || ""}\n[${new Date().toISOString()}] Customer payment notification: ${message || "Payment completed"}`

    await billDatabase.updateBill(billId, {
      notes: updatedNotes.trim(),
    })

    return NextResponse.json({
      success: true,
      message: "Payment notification sent successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error sending payment notification:", error)

    // Different error responses based on error type
    if (error instanceof Error && error.message.includes("temporarily unavailable")) {
      return NextResponse.json(
        {
          error: "Service temporarily unavailable",
          code: "SERVICE_UNAVAILABLE",
          message: "Notification service is currently unavailable. Please try again later.",
          retryAfter: 60, // seconds
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        message: "Failed to send payment notification",
      },
      { status: 500 },
    )
  }
}
