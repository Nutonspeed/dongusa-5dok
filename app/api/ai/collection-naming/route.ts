import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, fabricType, style, colors, description } = await request.json()

    if (!imageUrl) {
      return new Response("Image URL is required", { status: 400 })
    }

    // Deterministic mock without external AI dependency
    const thaiBase = style || fabricType || "แรงบันดาลใจจากผ้า"
    const colorNote = colors ? `โทนสี ${colors}` : "โทนสีที่กลมกลืน"
    const desc = description || "สะท้อนภาพลักษณ์พรีเมียม เหมาะกับบ้านสมัยใหม่"

    const items = [
      { th: `เสน่ห์${thaiBase}`, en: `${(thaiBase || "Inspiration").toString().replace(/\s+/g, " ").trim()} Elegance` },
      { th: `นิยามแห่ง${thaiBase}`, en: `${(thaiBase || "Design").toString().replace(/\s+/g, " ").trim()} Definition` },
      { th: `บทกวีแห่ง${thaiBase}`, en: `${(thaiBase || "Fabric").toString().replace(/\s+/g, " ").trim()} Poem` },
      { th: `ออร่าแห่ง${thaiBase}`, en: `${(thaiBase || "Aura").toString().replace(/\s+/g, " ").trim()} Aura` },
      { th: `สุนทรียะแห่ง${thaiBase}`, en: `${(thaiBase || "Aesthetic").toString().replace(/\s+/g, " ").trim()} Aesthetic` },
    ].map((x, i) => ({
      index: i + 1,
      thai: x.th,
      english: x.en,
      reason: `${colorNote} ผสานความลงตัวของสไตล์ ${style || "ร่วมสมัย"}`,
      note: desc,
    }))

    return Response.json({
      suggestions: items,
      metadata: {
        imageUrl,
        fabricType,
        style,
        colors,
        description,
        generatedAt: new Date().toISOString(),
        mocked: true,
      },
    })
  } catch (error) {
    console.error("Error generating collection names:", error)
    return new Response("Failed to generate collection names", { status: 500 })
  }
}
