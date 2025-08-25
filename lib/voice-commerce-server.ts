import { voiceCommerce } from "./voice-commerce-engine"
import type { VoiceResponse } from "./voice-commerce-engine"

// Thin server wrapper around voiceCommerce to provide a stable import surface for server code.
// Keeps error handling localized and returns a safe fallback on failures.
export async function processServerCommand(
  sessionId: string,
  transcript?: string,
  audioBlob?: Blob | null,
): Promise<VoiceResponse> {
  try {
    const resp = await voiceCommerce.processVoiceCommandServer(sessionId, audioBlob ?? null, transcript ?? "")
    return resp
  } catch {
    return {
      text: "ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผลคำสั่ง กรุณาลองใหม่อีกครั้ง",
      actions: [],
      follow_up_questions: [],
      confidence: 0.1,
    }
  }
}

// Convenience: create a server session (delegates to engine.startVoiceSession)
export async function createServerSession(userId?: string): Promise<string> {
  return await voiceCommerce.startVoiceSession(userId)
}
