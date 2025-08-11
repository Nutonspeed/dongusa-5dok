import { type NextRequest, NextResponse } from "next/server"

// Mock bill database
const mockBills = new Map()

// Mock email service
const mockEmailService = {
  async sendEmail(options: { to: string; subject: string; html: string }) {
    console.log("Mock email sent:", options)
    return { success: true }
  },
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { paymentAmount, paymentMethod } = await request.json()

    // Mock bill data
    const bill = {
      id,
      billNumber: `BILL-${id}`,
      customerEmail: "customer@example.com",
      amount: paymentAmount,
      status: "pending",
    }

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    // Update bill with payment information
    const updatedBill = {
      ...bill,
      status: "paid",
      paidAmount: paymentAmount,
      paymentMethod,
      paidAt: new Date().toISOString(),
    }

    // Store updated bill
    mockBills.set(id, updatedBill)

    // Send payment confirmation email
    await mockEmailService.sendEmail({
      to: bill.customerEmail,
      subject: `Payment Confirmation - Bill #${bill.billNumber}`,
      html: `
        <h2>Payment Received</h2>
        <p>Thank you for your payment of $${paymentAmount} for Bill #${bill.billNumber}.</p>
        <p>Payment Method: ${paymentMethod}</p>
        <p>Your order is now being processed.</p>
      `,
    })

    return NextResponse.json({
      success: true,
      bill: updatedBill,
      message: "Payment notification sent successfully",
    })
  } catch (error) {
    console.error("Error processing payment notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
