import { NextResponse, type NextRequest } from "next/server"
import { USE_SUPABASE } from "@/lib/runtime"
import { createServerClient } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { requireAdmin } from "@/lib/auth/requireAdmin"
import { notifications } from "@/lib/notifications"

function generateTrackingNumber(): string {
  return `TH${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

export async function POST(request: NextRequest) {
  await requireAdmin(request)
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
    const supabase = await createServerClient()

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

        // Map orderId -> tracking number from inserted labels
        const labelsRaw = (data || labelRecords).reduce((acc: any, rec: any) => {
          acc[rec.order_id || rec.orderId] = rec.tracking_number || rec.trackingNumber
          return acc
        }, {})
        const labels: Record<string, string> = labelsRaw;

        // Try fetch minimal contact info for notifications (optional fields)
        const { data: ordersForContact } = await supabase
          .from("orders")
          .select("id, order_number, customer_email, customer_phone")
          .in("id", orderIds)

        // Fire notifications per order if contact info is present
        if (ordersForContact && ordersForContact.length) {
          await Promise.all(
            ordersForContact.map(async (ord: any) => {
              const tracking = labels[ord.id]
              if (!tracking) return
              try {
                await notifications.notifyOrderStatus({
                  email: ord.customer_email || undefined,
                  phone: ord.customer_phone || undefined,
                  orderId: ord.order_number || ord.id,
                  status: "กำลังจัดส่ง",
                  tracking,
                })
              } catch (e) {
                logger.warn(`notifyOrderStatus shipment failed for order ${ord.id}:`, e)
              }
            }),
          )
        }

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
