import { type NextRequest, NextResponse } from "next/server"
import { messengerService } from "@/lib/messenger-integration"
import { conversionTracker } from "@/lib/conversion-tracking"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { billId, customerName, totalAmount, customMessage, sessionId } = body

    if (!billId || !customerName || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields: billId, customerName, totalAmount" }, { status: 400 })
    }

    // สร้าง URL ของบิล
    const billUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"}/bill/view/${billId}`

    // ส่งบิลไปยัง Messenger
    const messengerUrl = await messengerService.sendBillToMessenger({
      billId,
      customerName,
      totalAmount,
      billUrl,
      customMessage,
    })

    // ติดตาม conversion
    if (sessionId) {
      await conversionTracker.trackMessengerClick("bill_share", billId, sessionId)
    }

    return NextResponse.json({
      success: true,
      messengerUrl,
      billUrl,
      message: "Bill shared to Messenger successfully",
    })
  } catch (error) {
    console.error("Error sharing bill to Messenger:", error)
    return NextResponse.json({ error: "Failed to share bill" }, { status: 500 })
  }
}
