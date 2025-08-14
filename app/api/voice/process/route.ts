import { type NextRequest, NextResponse } from "next/server"
import { voiceCommerce } from "@/lib/voice-commerce-engine"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sessionId = formData.get("session_id") as string
    const transcript = formData.get("transcript") as string
    const audioBlob = formData.get("audio") as File | null

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    let audioBuffer: Blob | undefined
    if (audioBlob) {
      const arrayBuffer = await audioBlob.arrayBuffer()
      audioBuffer = new Blob([arrayBuffer], { type: audioBlob.type })
    }

    const response = await voiceCommerce.processVoiceCommand(sessionId, audioBuffer, transcript)

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error("Error in voice processing API:", error)
    return NextResponse.json({ error: "Failed to process voice command" }, { status: 500 })
  }
}
