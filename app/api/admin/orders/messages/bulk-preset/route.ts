import { NextResponse, type NextRequest } from "next/server"
import { USE_SUPABASE } from "@/lib/runtime"
import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

const MESSAGE_PRESETS: Record<string, { name: string; template: string }> = {
  payment_reminder: {
    name: "แจ้งเตือนชำระเงิน",
    template: "สวัสดีครับ/ค่ะ กรุณาชำระเงินสำหรับออร์เดอร์ {orderId} ยอด {amount} บาท ภายใน 24 ชั่วโมง ขอบคุณครับ/ค่ะ",
  },
  production_update: {
    name: "อัพเดทการผลิต",
    template: "สวัสดีครับ/ค่ะ ออร์เดอร์ {orderId} ของคุณอยู่ระหว่างการผลิต คาดว่าจะเสร็จภายใน 3-5 วันทำการ ขอบคุณครับ/ค่ะ",
  },
  ready_to_ship: {
    name: "พร้อมจัดส่ง",
    template: "สวัสดีครับ/ค่ะ ออร์เดอร์ {orderId} ของคุณพร้อมจัดส่งแล้ว เลขพัสดุ: {trackingNumber} ขอบคุณครับ/ค่ะ",
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orderIds: string[] = body?.orderIds || []
    const presetId: string = body?.presetId

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !presetId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body. Expected orderIds array and presetId string.",
        },
        { status: 400 },
      )
    }

    const preset = MESSAGE_PRESETS[presetId]
    if (!preset) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid preset ID",
        },
        { status: 400 },
      )
    }

    if (USE_SUPABASE) {
      try {
        const supabase = createClient()

        // Insert message records for each order
        const messageRecords = orderIds.map((orderId) => ({
          order_id: orderId,
          template_id: presetId,
          template_name: preset.name,
          content: preset.template,
          sent_at: new Date().toISOString(),
          status: "sent",
        }))

        const { error } = await supabase.from("order_messages").insert(messageRecords)

        if (error) {
          logger.error("Database insert failed:", error)
          throw error
        }

        logger.info(`Sent ${orderIds.length} messages using preset: ${presetId}`)

        return NextResponse.json({
          success: true,
          message: `Sent messages to ${orderIds.length} orders using preset ${preset.name}`,
          sentCount: orderIds.length,
          mode: "database",
        })
      } catch (error) {
        logger.error("Bulk message sending failed:", error)
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
    await new Promise((resolve) => setTimeout(resolve, 1200))

    logger.info("Mock bulk message sending:", { orderIds, presetId })

    return NextResponse.json({
      success: true,
      message: `Sent messages to ${orderIds.length} orders using preset ${preset.name}`,
      sentCount: orderIds.length,
      mode: "mock",
    })
  } catch (error) {
    logger.error("Bulk message sending error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
