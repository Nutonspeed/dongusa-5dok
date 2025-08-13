import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    // Validate event data
    if (!event.eventType || !event.sessionId || !event.timestamp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Here you would typically save to database
    // For now, we'll just log it
    console.log("Conversion Event:", {
      type: event.eventType,
      session: event.sessionId,
      data: event.data,
      timestamp: event.timestamp,
    })

    // You could also send to external analytics services here
    // await sendToGoogleAnalytics(event)
    // await sendToMixpanel(event)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing conversion event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("type")
    const sessionId = searchParams.get("session")
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    // Mock data for demonstration
    const mockEvents = [
      {
        eventType: "fabric_view",
        sessionId: "session_123",
        timestamp: new Date().toISOString(),
        data: {
          fabricId: "fabric_001",
          fabricName: "ลายดอกไม้สีฟ้า",
          collectionName: "Classic Collection",
          source: "gallery",
        },
      },
    ]

    // Filter events based on query parameters
    let filteredEvents = mockEvents

    if (eventType) {
      filteredEvents = filteredEvents.filter((e) => e.eventType === eventType)
    }

    if (sessionId) {
      filteredEvents = filteredEvents.filter((e) => e.sessionId === sessionId)
    }

    return NextResponse.json({
      events: filteredEvents,
      total: filteredEvents.length,
      summary: {
        fabric_views: filteredEvents.filter((e) => e.eventType === "fabric_view").length,
        fabric_selects: filteredEvents.filter((e) => e.eventType === "fabric_select").length,
        quote_requests: filteredEvents.filter((e) => e.eventType === "quote_request").length,
        bill_views: filteredEvents.filter((e) => e.eventType === "bill_view").length,
      },
    })
  } catch (error) {
    console.error("Error fetching conversion events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
