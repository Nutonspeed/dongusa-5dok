import { type NextRequest, NextResponse } from "next/server"

// Mock database
const bills = new Map()

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const customerId = url.searchParams.get("customerId")

    if (customerId) {
      const customerBills = Array.from(bills.values()).filter((bill: any) => bill.customerId === customerId)
      return NextResponse.json({ bills: customerBills })
    }

    return NextResponse.json({ bills: Array.from(bills.values()) })
  } catch (error) {
    console.error("Error fetching bills:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, customerEmail, customerAddress, items, notes } = body

    // Generate bill ID
    const billId = Math.random().toString(36).substring(2, 8)
    const billNumber = `BILL-${billId.toUpperCase()}`

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0)
    const shipping = subtotal > 3000 ? 0 : 150 // Free shipping over 3000 THB
    const total = subtotal + shipping

    const newBill = {
      id: billId,
      billNumber,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      items,
      subtotal,
      shipping,
      total,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      notes,
      qrCode:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // Mock QR code
    }

    bills.set(billId, newBill)

    return NextResponse.json({
      success: true,
      bill: newBill,
      billUrl: `/bill/view/${billId}`,
    })
  } catch (error) {
    console.error("Error creating bill:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
