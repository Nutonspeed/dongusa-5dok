import { NextResponse } from "next/server"
import { dataManagementStrategy } from "@/lib/supabase-data-management-strategy"

export async function GET() {
  try {
    const report = await dataManagementStrategy.getDataManagementReport()
    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Data management report error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate data management report" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const result = await dataManagementStrategy.executeDataManagementStrategy()
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Data management execution error:", error)
    return NextResponse.json({ success: false, error: "Failed to execute data management strategy" }, { status: 500 })
  }
}
