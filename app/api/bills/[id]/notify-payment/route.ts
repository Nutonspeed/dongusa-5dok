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
    const { id } = params
    const formData = await request.formData()

    const proof = formData.get("proof") as File | null
    const note = formData.get("note") as string
    const billId = formData.get("billId") as string

    // Mock payment notification processing
    console.log("Payment notification received:", {
      billId: id,
      hasProof: !!proof,
      note,
      timestamp: new Date().toISOString(),
    })

    // In real implementation, you would:
    // 1. Save the payment proof file
    // 2. Update bill status to "paid"
    // 3. Send notification to admin
    // 4. Log the payment notification

    // Mock response
    return NextResponse.json({
      success: true,
      message: "แจ้งการชำระเงินเรียบร้อยแล้ว ทางร้านจะตรวจสอบและอัปเดตสถานะให้ครับ",
      notificationId: Math.random().toString(36).substring(2, 8),
    })
  } catch (error) {
    console.error("Error processing payment notification:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการแจ้งชำระเงิน" }, { status: 500 })
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
