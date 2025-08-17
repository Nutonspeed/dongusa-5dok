import { type NextRequest, NextResponse } from "next/server"
import { USE_SUPABASE } from "@/lib/runtime"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    // Validate event data
    if (!event.eventType || !event.sessionId || !event.timestamp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!USE_SUPABASE) {
      logger.info("📊 [MOCK] Conversion Event:", {
        type: event.eventType,
        session: event.sessionId,
        data: event.data,
        timestamp: event.timestamp,
        userAgent: request.headers.get("user-agent"),
        ip: request.headers.get("x-forwarded-for") || "unknown",
      })

      return NextResponse.json({
        success: true,
        eventId: `mock-${Date.now()}`,
        processed: true,
      })
    }

    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data, error } = await supabase
      .from("conversion_events")
      .insert({
        event_type: event.eventType,
        session_id: event.sessionId,
        event_data: event.data,
        timestamp: event.timestamp,
        user_agent: request.headers.get("user-agent"),
        ip_address: request.headers.get("x-forwarded-for"),
      })
      .select()
      .single()

    if (error) {
      logger.error("Error saving conversion event:", error)
      throw error
    }

    return NextResponse.json({
      success: true,
      eventId: data.id,
      processed: true,
    })
  } catch (error) {
    logger.error("Error processing conversion event:", error)
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

    if (!USE_SUPABASE) {
      const mockEvents = [
        {
          id: "mock-1",
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
        {
          id: "mock-2",
          eventType: "fabric_select",
          sessionId: "session_123",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          data: {
            fabricId: "fabric_001",
            selectedOptions: { size: "large", color: "blue" },
          },
        },
        {
          id: "mock-3",
          eventType: "quote_request",
          sessionId: "session_123",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          data: {
            fabricId: "fabric_001",
            customerInfo: { name: "คุณสมชาย", phone: "081-234-5678" },
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
        conversionRate: {
          viewToSelect: 0.65,
          selectToQuote: 0.45,
          quoteToOrder: 0.78,
        },
        source: "mock",
      })
    }

    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    let query = supabase.from("conversion_events").select("*")

    if (eventType) query = query.eq("event_type", eventType)
    if (sessionId) query = query.eq("session_id", sessionId)
    if (startDate) query = query.gte("timestamp", startDate)
    if (endDate) query = query.lte("timestamp", endDate)

    const { data: events, error } = await query.order("timestamp", { ascending: false })

    if (error) {
      logger.error("Error fetching conversion events:", error)
      throw error
    }

    // Calculate conversion funnel
    const summary = {
      fabric_views: events?.filter((e) => e.event_type === "fabric_view").length || 0,
      fabric_selects: events?.filter((e) => e.event_type === "fabric_select").length || 0,
      quote_requests: events?.filter((e) => e.event_type === "quote_request").length || 0,
      bill_views: events?.filter((e) => e.event_type === "bill_view").length || 0,
    }

    const conversionRate = {
      viewToSelect: summary.fabric_views > 0 ? summary.fabric_selects / summary.fabric_views : 0,
      selectToQuote: summary.fabric_selects > 0 ? summary.quote_requests / summary.fabric_selects : 0,
      quoteToOrder: summary.quote_requests > 0 ? summary.bill_views / summary.quote_requests : 0,
    }

    return NextResponse.json({
      events: events || [],
      total: events?.length || 0,
      summary,
      conversionRate,
      source: "supabase",
    })
  } catch (error) {
    logger.error("Error fetching conversion events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
