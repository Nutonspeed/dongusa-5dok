import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const startTime = Date.now()

    // Test Supabase connection
    const { data, error } = await supabase.auth.getSession()

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: "ok",
      responseTime,
      timestamp: new Date().toISOString(),
      version: "2.0",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Supabase connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
