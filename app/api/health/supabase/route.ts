import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

    const [authTest, dbTest] = await Promise.allSettled([
      supabase.auth.getSession(),
      supabase.from("products").select("count").limit(1),
    ])

    const responseTime = Date.now() - startTime

    const authStatus = authTest.status === "fulfilled" ? "ok" : "error"
    const dbStatus = dbTest.status === "fulfilled" && dbTest.value.error === null ? "ok" : "error"

    return NextResponse.json({
      status: authStatus === "ok" && dbStatus === "ok" ? "ok" : "degraded",
      responseTime,
      services: {
        auth: authStatus,
        database: dbStatus,
      },
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
