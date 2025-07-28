import { type NextRequest, NextResponse } from "next/server"

// Mock database
const bills = new Map()

// Initialize with sample data
if (bills.size === 0) {
  const sampleBill = {
    id: "abc123",
    billNumber: "BILL-ABC123",
    customerName: "คุณสมชาย ใจดี",
    customerPhone: "081-234-5678",
    customerEmail: "somchai@email.com",
    customerAddress: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110",
    items: [
      {
        id: "1",
        name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
        description: "โซฟา 3 ที่นั่ง สีน้ำเงินเข้ม ลาย Arctic White",
        quantity: 1,
        price: 2890,
        total: 2890,
      },
      {
        id: "2",
        name: "หมอนอิงเซ็ต",
        description: "หมอนอิงลายเดียวกัน ขนาด 45x45 ซม. จำนวน 2 ใบ",
        quantity: 2,
        price: 350,
        total: 700,
      },
    ],
    subtotal: 3590,
    shipping: 150,
    total: 3740,
    status: "confirmed",
    paymentStatus: "pending",
    createdAt: "2024-01-25T10:30:00",
    dueDate: "2024-01-27T23:59:59",
    notes: "ลูกค้าขอให้รีบ เพราะมีงานเลี้ยงที่บ้าน",
    qrCode:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    estimatedDelivery: "2024-02-05",
  }
  bills.set("abc123", sampleBill)
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const bill = bills.get(id)

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({ bill })
  } catch (error) {
    console.error("Error fetching bill:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()
    const bill = bills.get(id)

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    const updatedBill = { ...bill, ...updates, updatedAt: new Date().toISOString() }
    bills.set(id, updatedBill)

    return NextResponse.json({ success: true, bill: updatedBill })
  } catch (error) {
    console.error("Error updating bill:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
