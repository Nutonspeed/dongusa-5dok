import { NextResponse } from "next/server"
import { performanceOptimizer } from "@/lib/supabase-performance-optimizer"

export async function GET() {
  try {
    const report = await performanceOptimizer.generatePerformanceReport()
    const metrics = performanceOptimizer.getPerformanceMetrics()

    return NextResponse.json({
      success: true,
      report,
      metrics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
  // console.error("Performance report error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate performance report" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const result = await performanceOptimizer.optimizeDatabase()
    return NextResponse.json({ success: true, result })
  } catch (error) {
  // console.error("Performance optimization error:", error)
    return NextResponse.json({ success: false, error: "Failed to execute performance optimization" }, { status: 500 })
  }
}
