import { type NextRequest, NextResponse } from "next/server"
import { messengerService } from "@/lib/messenger-integration"
import { conversionTracker, ConversionTrackingService } from "@/lib/conversion-tracking"

export async function POST(request: NextRequest) {
  try {
    const { fabrics, sessionId, customerMessage } = await request.json()

    if (!fabrics || !Array.isArray(fabrics) || fabrics.length === 0) {
      return NextResponse.json({ success: false, error: "No fabrics provided" }, { status: 400 })
    }

    // Create bulk message
    const fabricList = fabrics
      .map((fabric: any, index: number) => `${index + 1}. ${fabric.name} (${fabric.collectionName}) - ${fabric.price}`)
      .join("\n")

    const bulkMessage = `🎨 ลายผ้าที่เลือก (${fabrics.length} ลาย):

${fabricList}

${customerMessage || `สนใจลายผ้าทั้ง ${fabrics.length} ลาย กรุณาแจ้งราคาและรายละเอียดเพิ่มเติมครับ/ค่ะ`}

กรุณาแจ้งขนาดโซฟาและความต้องการพิเศษด้วยครับ/ค่ะ`

    // Create messenger URL
    const messengerUrl = messengerService.createMessengerUrl(bulkMessage)

    // Track bulk selection (server-side)
    await conversionTracker.trackEvent({
      eventType: "fabric_select" as any,
      userId: ConversionTrackingService.getUserId(),
      sessionId: sessionId || ConversionTrackingService.generateSessionId(),
      source: "web",
      data: {
        bulk_selection: true,
        fabric_count: fabrics.length,
        fabric_ids: fabrics.map((f: any) => f.id),
        fabric_names: fabrics.map((f: any) => f.name),
        collections: [...new Set(fabrics.map((f: any) => f.collectionName))],
      },
    })

    return NextResponse.json({
      success: true,
      messengerUrl,
      message: "Bulk fabric selection sent successfully",
      fabricCount: fabrics.length,
    })
  } catch (error) {
    console.error("Error in bulk fabric select:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
