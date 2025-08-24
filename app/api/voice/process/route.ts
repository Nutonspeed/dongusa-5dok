import { type NextRequest, NextResponse } from "next/server"
import { processServerCommand } from "@/lib/voice-commerce-server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sessionId = (formData.get("session_id") as string) || ""
    const transcript = (formData.get("transcript") as string) || ""
    const audioBlob = (formData.get("audio") as File | null) ?? null

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Best-effort build audio blob (not required when transcript is provided)
    let audioBuffer: any | undefined
    if (audioBlob) {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer()
        audioBuffer = new Blob([arrayBuffer], { type: audioBlob.type })
      } catch {
        audioBuffer = undefined
      }
    }

    const response = await processServerCommand(sessionId, transcript, audioBuffer ?? null)

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process voice command" }, { status: 500 })
  }
}
}
}
      const text = transcript?.trim() || ""
      let fallbackResponse = {
        text: "ขออภัย ไม่สามารถประมวลผลเสียงในขณะนี้ กรุณาพิมพ์คำสั่งแทนหรือทดลองอีกครั้ง",
        actions: [] as any[],
        follow_up_questions: [] as string[],
        confidence: 0.1,
      }

      if (text) {
        try {
          const nlp = await advancedAI.analyzeText(text)
          // Simple mapping: purchase/inquiry => quick reply
          if (nlp.intent === "purchase") {
            fallbackResponse = {
              text: "ฉันเข้าใจว่าคุณต้องการสั่งซื้อ ต้องการให้ฉันเพิ่มสินค้าลงตะกร้าหรือไปหน้าชำระเงินไหมคะ?",
              actions: [{ type: "navigate", payload: { path: "/cart" } }],
              follow_up_questions: ["ต้องการเพิ่มจำนวนกี่ชิ้น?", "ต้องการเลือกสีหรือตัวเลือกเพิ่มเติมไหม?"],
              confidence: nlp.confidence,
            }
          } else if (nlp.intent === "inquiry") {
            fallbackResponse = {
              text: "ดูเหมือนว่าคุณมีคำถามเกี่ยวกับสินค้า ฉันช่วยค้นหาข้อมูลให้ได้ค่ะ ต้องการให้ค้นหาสินค้าใดเป็นพิเศษไหมคะ?",
              actions: [{ type: "show_results", payload: { query: text } }],
              follow_up_questions: ["ต้องการดูสินค้าที่เกี่ยวข้องหรือข้อมูลเพิ่มเติมไหมคะ?"],
              confidence: nlp.confidence,
            }
          } else {
            fallbackResponse = {
              text: "ขอบคุณสำหรับคำสั่งของคุณ: " + text,
              actions: [],
              follow_up_questions: ["ต้องการให้ช่วยอะไรต่อไหมคะ?"],
              confidence: nlp.confidence,
            }
          }
        } catch {
          // keep generic fallbackResponse
        }
      }

      return NextResponse.json({ success: true, data: fallbackResponse })
    }
  } catch (error) {
    // console.error("Error in voice processing API:", error)
    return NextResponse.json({ error: "Failed to process voice command" }, { status: 500 })
  }
}
