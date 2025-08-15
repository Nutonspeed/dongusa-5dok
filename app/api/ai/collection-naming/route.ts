import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, fabricType, style, colors, description } = await request.json()

    if (!imageUrl) {
      return new Response("Image URL is required", { status: 400 })
    }

    const prompt = `
    คุณเป็นผู้เชี่ยวชาญด้านการออกแบบและการตั้งชื่อคอลเลกชันผ้าคลุมโซฟา กรุณาวิเคราะห์ลายผ้าและข้อมูลต่อไปนี้:

    ข้อมูลผ้า:
    - URL รูปภาพ: ${imageUrl}
    - ประเภทผ้า: ${fabricType || "ไม่ระบุ"}
    - สไตล์: ${style || "ไม่ระบุ"}
    - สีหลัก: ${colors || "ไม่ระบุ"}
    - คำอธิบาย: ${description || "ไม่ระบุ"}

    กรุณาเสนอชื่อคอลเลกชันที่เหมาะสม 5 ชื่อ โดยแต่ละชื่อควรมี:
    1. ชื่อภาษาไทยที่สวยงามและดึงดูดใจ
    2. ชื่อภาษาอังกฤษที่เข้าใจง่าย
    3. เหตุผลที่เลือกชื่อนี้
    4. คำอธิบายสั้นๆ เกี่ยวกับความเหมาะสมของชื่อ

    ตัวอย่างรูปแบบการตอบ:
    1. **ชื่อไทย**: "บลูมมิ่ง การ์เด้น" | **ชื่ออังกฤษ**: "Blooming Garden"
       **เหตุผล**: ลายดอกไม้ที่บานสะพรั่งเหมือนสวนที่เบิกบาน
       **คำอธิบาย**: เหมาะสำหรับผู้ที่ชื่นชอบธรรมชาติและความสดใส

    กรุณาสร้างชื่อที่มีความหมายลึกซึ้ง สร้างสรรค์ และสะท้อนถึงคุณภาพพรีเมียมของผลิตภัณฑ์
    `

    const result = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt: prompt,
      system: `คุณเป็นผู้เชี่ยวชาญด้านการตั้งชื่อคอลเลกชันผ้าและการออกแบบ มีความรู้ลึกซึ้งเกี่ยวกับแฟชั่น สีสัน และการตลาด 
      คุณสามารถสร้างชื่อที่มีเอกลักษณ์ ดึงดูดใจ และสื่อถึงคุณภาพของผลิตภัณฑ์ได้อย่างยอดเยี่ยม`,
      maxTokens: 1000,
      temperature: 0.8,
    })

    return Response.json({
      suggestions: result.text,
      metadata: {
        imageUrl,
        fabricType,
        style,
        colors,
        description,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error generating collection names:", error)
    return new Response("Failed to generate collection names", { status: 500 })
  }
}
