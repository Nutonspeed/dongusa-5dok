import { NextResponse, type NextRequest } from "next/server"
import { USE_SUPABASE } from "@/lib/runtime"
import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

function generateTrackingNumber(): string {
  return `TH${Math.random().toString(36).substr(2, 9).toUpperCase()}`
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

        // Create shipping labels for each order
        const labelRecords = orderIds.map((orderId) => {
          const trackingNumber = generateTrackingNumber()
          return {
            order_id: orderId,
            tracking_number: trackingNumber,
            carrier: "Thailand Post",
            label_url: `/shipping-labels/${orderId}.pdf`,
            created_at: new Date().toISOString(),
            status: "created",
          }
        })

        const { data, error } = await supabase.from("shipping_labels").insert(labelRecords).select()

        if (error) {
          logger.error("Database insert failed:", error)
          throw error
        }

        // Update orders status to 'shipped'
        await supabase
          .from("orders")
          .update({
            status: "shipped",
            updated_at: new Date().toISOString(),
          })
          .in("id", orderIds)

        logger.info(`Created ${orderIds.length} shipping labels`)

        return NextResponse.json({
          success: true,
          message: `Created ${orderIds.length} shipping labels`,
          labels: data || labelRecords,
          mode: "database",
        })
      } catch (error) {
        logger.error("Shipping label creation failed:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Database operation failed",
          },
          { status: 500 },
        )
      }
    }

    // Mock mode - simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockLabels = orderIds.map((orderId: string) => ({
      orderId,
      trackingNumber: generateTrackingNumber(),
      carrier: "Thailand Post",
      labelUrl: `/shipping-labels/${orderId}.pdf`,
    }))

    logger.info("Mock shipping label creation for orders:", orderIds)

    return NextResponse.json({
      success: true,
      message: `Created ${orderIds.length} shipping labels`,
      labels: mockLabels,
      mode: "mock",
    })
  } catch (error) {
    logger.error("Shipping label creation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
