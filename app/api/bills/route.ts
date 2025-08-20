import { NextResponse } from "next/server"
import { USE_SUPABASE } from "@/lib/runtime"
import { logger } from "@/lib/logger"
import { notifications } from "@/lib/notifications"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    if (!USE_SUPABASE) {
      const id = crypto.randomUUID()
      const mockBill = {
        id,
        billNumber: body.billNumber || `BILL-${Date.now()}`,
        customerEmail: body.customerEmail || "customer@example.com",
        customerName: body.customerName || "คุณลูกค้าตัวอย่าง",
        customerPhone: body.customerPhone || "081-234-5678",
        amount: body.amount || 2890,
        subtotal: body.subtotal || 2890,
        tax: body.tax || 0,
        shipping: body.shipping || 0,
        status: body.status || "draft",
        paymentMethod: body.paymentMethod || "bank_transfer",
        items: body.items || [
          {
            id: "item-1",
            name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
            quantity: 1,
            price: 2890,
            total: 2890,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: body.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: body.notes || "",
        mock: true,
      }

      logger.info("📄 [MOCK] Bill created:", { id, amount: mockBill.amount })

      // Fire notification (order created)
      try {
        await notifications.notifyOrderStatus({
          email: mockBill.customerEmail,
          phone: mockBill.customerPhone,
          orderId: mockBill.billNumber || mockBill.id,
          status: "สั่งซื้อแล้ว",
          note: "สร้างบิลสำเร็จ",
        })
      } catch (e) {
        logger.warn("notifyOrderStatus (mock bill) failed:", e)
      }

      return NextResponse.json(mockBill, { status: 201 })
    }

    const { enhancedBillDatabase } = await import("@/lib/enhanced-bill-database")

    const billData = {
      billNumber: body.billNumber || `BILL-${Date.now()}`,
      customerEmail: body.customerEmail || "customer@example.com",
      customerName: body.customerName || "ลูกค้า",
      customerPhone: body.customerPhone,
      amount: body.amount || 0,
      subtotal: body.subtotal || body.amount || 0,
      tax: body.tax || 0,
      shipping: body.shipping || 0,
      status: body.status || "draft",
      paymentMethod: body.paymentMethod || "bank_transfer",
      items: body.items || [],
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
      dueDate: body.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const bill = await enhancedBillDatabase.createBill(billData)
    logger.info("📄 Bill created:", { id: bill.id, amount: bill.amount })

    // Fire notification (order created)
    try {
      await notifications.notifyOrderStatus({
        email: bill.customerEmail,
        phone: bill.customerPhone,
        orderId: bill.billNumber || bill.id,
        status: "สั่งซื้อแล้ว",
        note: "สร้างบิลสำเร็จ",
      })
    } catch (e) {
      logger.warn("notifyOrderStatus (bill created) failed:", e)
    }

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    logger.error("POST /api/bills error:", error)
    return NextResponse.json({ error: "bill_creation_failed" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const customerEmail = searchParams.get("customerEmail")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!USE_SUPABASE) {
      const mockBills = [
        {
          id: "bill-1",
          billNumber: "BILL-001",
          customerName: "คุณสมชาย ใจดี",
          customerEmail: "somchai@email.com",
          amount: 2890,
          status: "paid",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "bill-2",
          billNumber: "BILL-002",
          customerName: "คุณสมหญิง รักสวย",
          customerEmail: "somying@email.com",
          amount: 1950,
          status: "pending",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]

      let filteredBills = mockBills
      if (status) filteredBills = filteredBills.filter((b) => b.status === status)
      if (customerEmail) filteredBills = filteredBills.filter((b) => b.customerEmail === customerEmail)

      return NextResponse.json({
        bills: filteredBills.slice(0, limit),
        total: filteredBills.length,
        source: "mock",
      })
    }

    const { enhancedBillDatabase } = await import("@/lib/enhanced-bill-database")

    const filters: any = {}
    if (status) filters.status = status
    if (customerEmail) filters.customerEmail = customerEmail

    const bills = await enhancedBillDatabase.getBills(filters, limit)

    return NextResponse.json({
      bills,
      total: bills.length,
      source: "supabase",
    })
  } catch (error) {
    logger.error("GET /api/bills error:", error)
    return NextResponse.json({ error: "bill_fetch_failed" }, { status: 500 })
  }
}
