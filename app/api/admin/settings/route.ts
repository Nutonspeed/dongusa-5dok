export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const settings = await request.json()

    const { error } = await supabase.from("system_settings").upsert([
      {
        key: "admin_settings",
        value: settings,
        description: "Admin panel configuration settings",
      },
    ])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving admin settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("system_settings").select("value").eq("key", "admin_settings").single()

    if (error && error.code !== "PGRST116") throw error

    return NextResponse.json({
      settings: data?.value || {},
      success: true,
    })
  } catch (error) {
    console.error("Error loading admin settings:", error)
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}
