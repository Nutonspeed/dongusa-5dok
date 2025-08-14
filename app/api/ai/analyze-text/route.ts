import { type NextRequest, NextResponse } from "next/server"
import { advancedAI } from "@/lib/advanced-ai-features"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 })
    }

    const analysis = await advancedAI.analyzeText(text)

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error("Error in text analysis API:", error)
    return NextResponse.json({ error: "Failed to analyze text" }, { status: 500 })
  }
}
