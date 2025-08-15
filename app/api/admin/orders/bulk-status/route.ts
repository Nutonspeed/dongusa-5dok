import { NextResponse, type NextRequest } from "next/server"
import { USE_SUPABASE } from "@/lib/runtime"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import { OrderStatus } from "@/lib/i18n/status"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orderIds: string[] = body?.orderIds || []
    const normalize = (s: string) => s?.trim().toUpperCase()
    const allow = new Set(Object.values(OrderStatus))
    const newStatusRaw = body?.status ?? body?.newStatus
    const newStatus = normalize(newStatusRaw)

    if (!allow.has(newStatus as OrderStatus)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 })
    }

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !newStatus) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body. Expected orderIds array and status string.",
        },
        { status: 400 },
      )
    }

    if (USE_SUPABASE) {
      try {
        const supabase = createClient()

        // Update orders status in database
        const { error } = await supabase
          .from("orders")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .in("id", orderIds)

        if (error) {
          logger.error("Database update failed:", error)
          throw error
        }

        logger.info(`Updated ${orderIds.length} orders to status: ${newStatus}`)

        return NextResponse.json({
          success: true,
          message: `Updated ${orderIds.length} orders to ${newStatus}`,
          updated: orderIds.length,
          mode: "database",
        })
      } catch (error) {
        logger.error("Bulk status update failed:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Database update failed",
          },
          { status: 500 },
        )
      }
    }

    // Mock mode - simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 800))

    logger.info("Mock bulk status change:", { orderIds, newStatus })

    return NextResponse.json({
      success: true,
      message: `Updated ${orderIds.length} orders to ${newStatus}`,
      updated: orderIds.length,
      mode: "mock",
    })
  } catch (error) {
    logger.error("Bulk status update error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
