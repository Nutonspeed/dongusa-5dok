import { type NextRequest, NextResponse } from "next/server"

interface PaymentRequest {
  paymentAmount: number
  paymentMethod: string
}

interface BillItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Bill {
  id: string
  billNumber: string
  customerEmail: string
  customerName: string
  total: number
  status: string
  items: BillItem[]
  subtotal: number
  tax: number
  createdAt: string
  dueDate: string
  paidAmount?: number
  paymentMethod?: string
  paidAt?: string
}

// Mock function to get bill data - completely self-contained
function getMockBill(id: string): Bill {
  return {
    id,
    billNumber: `BILL-${id.slice(0, 8).toUpperCase()}`,
    customerEmail: "customer@example.com",
    customerName: "John Doe",
    total: 299.99,
    status: "pending",
    items: [
      {
        id: "item-1",
        description: "Custom Sofa Cover - Premium Fabric",
        quantity: 1,
        unitPrice: 299.99,
        total: 299.99,
      },
    ],
    subtotal: 299.99,
    tax: 0,
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

// Mock function to send email - completely self-contained
function sendMockEmail(to: string, subject: string, content: string): { success: boolean; messageId: string } {
  console.log(`📧 Mock Email Sent:`)
  console.log(`To: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Content: ${content.slice(0, 100)}...`)
  console.log(`Timestamp: ${new Date().toISOString()}`)

  return {
    success: true,
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Parse request body
    const body: PaymentRequest = await request.json()
    const { paymentAmount, paymentMethod } = body

    // Validate required fields
    if (!paymentAmount || !paymentMethod) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Payment amount and method are required",
        },
        { status: 400 },
      )
    }

    // Validate payment amount
    if (typeof paymentAmount !== "number" || paymentAmount <= 0) {
      return NextResponse.json(
        {
          error: "Invalid payment amount",
          message: "Payment amount must be a positive number",
        },
        { status: 400 },
      )
    }

    // Get bill ID from params
    const billId = params.id
    if (!billId) {
      return NextResponse.json(
        {
          error: "Missing bill ID",
          message: "Bill ID is required in the URL path",
        },
        { status: 400 },
      )
    }

    // Get mock bill data
    const originalBill = getMockBill(billId)

    // Create updated bill with payment information
    const updatedBill: Bill = {
      ...originalBill,
      status: "paid",
      paidAmount: paymentAmount,
      paymentMethod,
      paidAt: new Date().toISOString(),
    }

    // Generate email content
    const emailContent = `
      Payment Confirmation - Bill #${originalBill.billNumber}
      
      Dear ${originalBill.customerName},
      
      We have successfully received your payment of $${paymentAmount.toFixed(2)} for Bill #${originalBill.billNumber}.
      
      Payment Details:
      - Amount: $${paymentAmount.toFixed(2)}
      - Method: ${paymentMethod}
      - Date: ${new Date().toLocaleDateString()}
      - Bill Total: $${originalBill.total.toFixed(2)}
      
      Your order is now being processed and you will receive tracking information soon.
      
      Thank you for choosing our custom sofa cover service!
    `

    // Send mock email
    const emailResult = sendMockEmail(
      originalBill.customerEmail,
      `Payment Confirmation - Bill #${originalBill.billNumber}`,
      emailContent,
    )

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Payment notification sent successfully",
      data: {
        bill: updatedBill,
        emailSent: emailResult.success,
        emailMessageId: emailResult.messageId,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing payment notification:", error)

    // Return error response with safe error message
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to process payment notification. Please try again later.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only supports POST requests",
    },
    { status: 405 },
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only supports POST requests",
    },
    { status: 405 },
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only supports POST requests",
    },
    { status: 405 },
  )
}

export async function PATCH() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only supports POST requests",
    },
    { status: 405 },
  )
}
