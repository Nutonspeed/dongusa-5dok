import { NextResponse } from "next/server"
import { USE_SUPABASE } from "@/lib/runtime"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    if (!USE_SUPABASE) {
      const activeUsers = Math.floor(Math.random() * 100) + 50
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        users: Math.floor(Math.random() * 20) + 5,
      }))

      return NextResponse.json({
        activeUsers,
        hourlyData,
        peakHour: hourlyData.reduce((max, curr) => (curr.users > max.users ? curr : max)),
        timestamp: new Date().toISOString(),
        source: "mock",
      })
    }

    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get active sessions from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: sessions, error } = await supabase
      .from("user_sessions")
      .select("user_id, created_at")
      .gte("last_activity", oneHourAgo)

    if (error) {
      logger.error("Error fetching active users:", error)
      throw error
    }

    const activeUsers = new Set(sessions?.map((s) => s.user_id)).size || 0

    // Get hourly breakdown
    const { data: hourlyData, error: hourlyError } = await supabase.rpc("get_hourly_active_users")

    return NextResponse.json({
      activeUsers,
      hourlyData: hourlyData || [],
      timestamp: new Date().toISOString(),
      source: "supabase",
    })
  } catch (error) {
    logger.error("Error in active users analytics:", error)
    return NextResponse.json({ error: "Failed to get active users" }, { status: 500 })
  }
}
