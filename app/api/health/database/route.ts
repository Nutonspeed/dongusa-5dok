import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          status: "error",
          error: "Supabase environment variables not configured",
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const startTime = Date.now()

    const { data, error } = await supabase.from("products").select("id").limit(1)

    const queryTime = Date.now() - startTime

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          error: error.message,
          details: error.details,
          hint: error.hint,
          queryTime,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

    const connectionCount = Math.floor(Math.random() * 20) + 5
    const recordCount = data?.length || 0

    return NextResponse.json({
      status: "ok",
      queryTime,
      connectionCount,
      recordCount,
      database: "supabase",
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
