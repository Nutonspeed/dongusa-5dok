import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const startTime = Date.now()

    // Test database connection with a simple query
    const { data, error } = await supabase.from("products").select("count").limit(1)

    const queryTime = Date.now() - startTime

    if (error) {
      throw error
    }

    // Get connection info (mock for now)
    const connectionCount = Math.floor(Math.random() * 20) + 5

    return NextResponse.json({
      status: "ok",
      queryTime,
      connectionCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
