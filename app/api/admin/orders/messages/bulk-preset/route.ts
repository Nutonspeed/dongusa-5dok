import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderIds, presetId } = await request.json()

    // Mock message sending operation
    logger.info("Bulk message sending:", { orderIds, presetId })

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1200))

    return NextResponse.json({
      success: true,
      message: `Sent messages to ${orderIds.length} orders using preset ${presetId}`,
      sentCount: orderIds.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Message sending failed" }, { status: 500 })
  }
}
