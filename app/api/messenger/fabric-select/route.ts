import { type NextRequest, NextResponse } from "next/server"
import { messengerService } from "@/lib/messenger-integration"
import { conversionTracker } from "@/lib/conversion-tracking"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fabricId, fabricName, collectionName, imageUrl, price, customerMessage, sessionId } = body

    if (!fabricId || !fabricName || !collectionName) {
      return NextResponse.json(
        { error: "Missing required fields: fabricId, fabricName, collectionName" },
        { status: 400 },
      )
    }

    // ส่งลายผ้าไปยัง Messenger
    const messengerUrl = await messengerService.sendFabricSelection({
      fabricId,
      fabricName,
      collectionName,
      imageUrl: imageUrl || `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(fabricName)}`,
      price: price || "ราคาตามขนาด",
      customerMessage,
    })

    // ติดตาม conversion
    if (sessionId) {
      await conversionTracker.trackFabricSelect(fabricId, fabricName, collectionName, sessionId)
      await conversionTracker.trackMessengerClick("fabric_gallery", fabricName, sessionId)
    }

    return NextResponse.json({
      success: true,
      messengerUrl,
      message: "Fabric selection sent to Messenger successfully",
    })
  } catch (error) {
    console.error("Error sending fabric to Messenger:", error)
    return NextResponse.json({ error: "Failed to send fabric selection" }, { status: 500 })
  }
}
