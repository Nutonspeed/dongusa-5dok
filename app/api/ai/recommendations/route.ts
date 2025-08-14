import { type NextRequest, NextResponse } from "next/server"
import { advancedAI } from "@/lib/advanced-ai-features"

export async function POST(request: NextRequest) {
  try {
    const { customer_id, context = {} } = await request.json()

    if (!customer_id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const recommendations = await advancedAI.generatePersonalizedRecommendations(customer_id, context)

    return NextResponse.json({
      success: true,
      data: {
        customer_id,
        recommendations,
        generated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error in recommendations API:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
