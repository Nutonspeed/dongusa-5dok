import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data, error } = await supabase.rpc("execute_sql", { query: sql })

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: "SQL executed successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        type: "execution_error",
      },
      { status: 500 },
    )
  }
}
