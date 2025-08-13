import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

interface AnalyticsEvent {
  event: string
  category: string
  label?: string
  value?: number
  userId?: string
  sessionId?: string
  timestamp: string
  properties?: Record<string, any>
}

// In-memory storage for demo (use database in production)
const events: AnalyticsEvent[] = []

export async function POST(request: NextRequest) {
  try {
    const eventData: AnalyticsEvent = await request.json()

    // Validate required fields
    if (!eventData.event || !eventData.category) {
      return NextResponse.json({ error: "Missing required fields: event, category" }, { status: 400 })
    }

    // Add timestamp if not provided
    if (!eventData.timestamp) {
      eventData.timestamp = new Date().toISOString()
    }

    // Store event
    events.push(eventData)

    // Log important events
    if (eventData.category === "conversion" || eventData.category === "error") {
      logger.info("Analytics Event:", eventData)
    }

    return NextResponse.json({
      success: true,
      message: "Event tracked successfully",
    })
  } catch (error) {
    logger.error("Error tracking analytics event:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    let filteredEvents = events

    if (category) {
      filteredEvents = filteredEvents.filter((event) => event.category === category)
    }

    if (userId) {
      filteredEvents = filteredEvents.filter((event) => event.userId === userId)
    }

    // Return most recent events first
    const recentEvents = filteredEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      events: recentEvents,
      total: filteredEvents.length,
    })
  } catch (error) {
    logger.error("Error fetching analytics events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
