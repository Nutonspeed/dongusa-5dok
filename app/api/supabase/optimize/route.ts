import { NextResponse } from "next/server"
import { freePlanOptimizer } from "@/lib/supabase-free-plan-optimizer"

export async function GET() {
  try {
    const report = await freePlanOptimizer.generateOptimizationReport()
    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Optimization report error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate optimization report" }, { status: 500 })
  }
}

export async function POST() {
  try {
    await freePlanOptimizer.implementAllOptimizations()
    return NextResponse.json({ success: true, message: "All optimizations implemented successfully" })
  } catch (error) {
    console.error("Optimization implementation error:", error)
    return NextResponse.json({ success: false, error: "Failed to implement optimizations" }, { status: 500 })
  }
}
