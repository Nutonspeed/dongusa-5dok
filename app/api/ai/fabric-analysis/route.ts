import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, analysisType = "comprehensive" } = await request.json()

    if (!imageUrl) {
      return new Response("Image URL is required", { status: 400 })
    }

    let prompt = ""
    let systemMessage = ""

    switch (analysisType) {
      case "pattern":
        prompt = `วิเคราะห์ลายผ้าในรูปภาพนี้: ${imageUrl}
        
        กรุณาระบุ:
        1. ประเภทของลาย (เรขาคณิต, ดอกไม้, ลายเส้น, ลายจุด, ฯลฯ)
        2. ความซับซ้อนของลาย (เรียบง่าย, ปานกลาง, ซับซ้อน)
        3. ทิศทางของลาย (แนวตั้ง, แนวนอน, เฉียง, สุ่ม)
        4. ขนาดของลาย (เล็ก, กลาง, ใหญ่)
        5. ความเหมาะสมกับการใช้งาน`
        systemMessage = "คุณเป็นผู้เชี่ยวชาญด้านการวิเคราะห์ลายผ้าและการออกแบบ"
        break

      case "color":
        prompt = `วิเคราะห์สีและโทนสีของผ้าในรูปภาพนี้: ${imageUrl}
        
        กรุณาระบุ:
        1. สีหลักและสีรอง
        2. โทนสี (อบอุ่น, เย็น, กลาง)
        3. ความสว่าง (สว่าง, กลาง, เข้ม)
        4. ความเข้มข้นของสี
        5. การเข้ากันได้ของสีในการตกแต่งบ้าน`
        systemMessage = "คุณเป็นผู้เชี่ยวชาญด้านสีสันและการตกแต่งภายใน"
        break

      case "style":
        prompt = `วิเคราะห์สไตล์และความเหมาะสมของผ้าในรูปภาพนี้: ${imageUrl}
        
        กรุณาระบุ:
        1. สไตล์การออกแบบ (โมเดิร์น, คลาสสิก, วินเทจ, มินิมอล, ฯลฯ)
        2. ความเหมาะสมกับห้องต่างๆ
        3. กลุ่มลูกค้าเป้าหมาย
        4. ราคาที่เหมาะสม
        5. ข้อเสนอแนะในการจับคู่กับเฟอร์นิเจอร์`
        systemMessage = "คุณเป็นผู้เชี่ยวชาญด้านการออกแบบภายในและการตลาดผลิตภัณฑ์"
        break

      default:
        prompt = `วิเคราะห์ผ้าในรูปภาพนี้อย่างครอบคลุม: ${imageUrl}
        
        กรุณาวิเคราะห์:
        1. ลายและรูปแบบ
        2. สีสันและโทนสี
        3. สไตล์และความเหมาะสม
        4. คุณภาพที่คาดการณ์ได้
        5. ข้อเสนอแนะสำหรับการใช้งาน
        6. ราคาที่เหมาะสม
        7. กลุ่มลูกค้าเป้าหมาย`
        systemMessage = "คุณเป็นผู้เชี่ยวชาญด้านผ้าและการออกแบบผลิตภัณฑ์ มีประสบการณ์ในการวิเคราะห์คุณภาพและความเหมาะสมของผ้าต่างๆ"
    }

    const result = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt: prompt,
      system: systemMessage,
      maxTokens: 800,
      temperature: 0.7,
    })

    return Response.json({
      analysis: result.text,
      analysisType,
      imageUrl,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error analyzing fabric:", error)
    return new Response("Failed to analyze fabric", { status: 500 })
  }
}
