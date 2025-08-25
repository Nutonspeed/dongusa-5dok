import { type NextRequest, NextResponse } from "next/server"
import { processServerCommand } from "@/lib/voice-commerce-server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sessionId = String(formData.get("session_id") || "")
    const transcript = String(formData.get("transcript") || "")
    const audioFile = (formData.get("audio") as File) ?? null

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Best-effort convert uploaded File to Blob for server wrapper
    let audioBuffer: Blob | null = null
    if (audioFile) {
      try {
        const arrayBuffer = await audioFile.arrayBuffer()
        audioBuffer = new Blob([arrayBuffer], { type: audioFile.type })
      } catch {
        audioBuffer = null
      }
    }

    const data = await processServerCommand(sessionId, transcript, audioBuffer)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: "Failed to process voice command" }, { status: 500 })
  }
}
