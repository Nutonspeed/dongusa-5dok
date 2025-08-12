import { NextResponse, type NextRequest } from "next/server"
import { USE_SUPABASE } from "@/lib/runtime"
import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

export async function GET() {
  const csv = 'id,code,total\n1,ORD-001,1000\n'
  return new NextResponse(csv, {
    headers: { 'Content-Type': 'text/csv' },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orderIds: string[] = body?.orderIds || []

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body. Expected orderIds array.",
        },
        { status: 400 },
      )
    }

    if (USE_SUPABASE) {
      try {
        const supabase = createClient()

        // Fetch order data from database
        const { data: orders, error } = await supabase
          .from("orders")
          .select(`
            id,
            code,
            customer_name,
            customer_phone,
            customer_email,
            total,
            status,
            channel,
            created_at,
            notes
          `)
          .in("id", orderIds)

        if (error) {
          logger.error("Database query failed:", error)
          throw error
        }

        logger.info(`Exported ${orders?.length || 0} orders from database`)

        return NextResponse.json({
          success: true,
          message: `Exported ${orders?.length || 0} orders`,
          orders: orders || [],
          exportedCount: orders?.length || 0,
          mode: "database",
        })
      } catch (error) {
        logger.error("Bulk export failed:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Database query failed",
          },
          { status: 500 },
        )
      }
    }

    // Mock mode - simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate mock order data
    const mockOrders = orderIds.map((id, index) => ({
      id,
      code: `ORD-${String(index + 1).padStart(4, "0")}`,
      customer_name: `ลูกค้า ${index + 1}`,
      customer_phone: `08${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
      customer_email: `customer${index + 1}@example.com`,
      total: Math.floor(Math.random() * 5000) + 1000,
      status: ["pending", "confirmed", "production", "shipped"][Math.floor(Math.random() * 4)],
      channel: ["facebook", "line", "walkin"][Math.floor(Math.random() * 3)],
      created_at: new Date().toISOString(),
      notes: `หมายเหตุสำหรับออร์เดอร์ ${index + 1}`,
    }))

    logger.info("Mock export requested for orders:", orderIds)

    return NextResponse.json({
      success: true,
      message: `Exported ${orderIds.length} orders`,
      orders: mockOrders,
      exportedCount: orderIds.length,
      mode: "mock",
    })
  } catch (error) {
    logger.error("Bulk export error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
