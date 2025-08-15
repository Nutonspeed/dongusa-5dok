import { NextResponse } from "next/server"
import { usageMonitor } from "@/lib/supabase-usage-monitor"

export async function GET() {
  try {
    const metrics = await usageMonitor.getCurrentMetrics()
    return NextResponse.json({ success: true, metrics })
  } catch (error) {
    console.error("Usage metrics error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch usage metrics" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const report = await usageMonitor.getUsageReport()
    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Usage report error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate usage report" }, { status: 500 })
  }
}
