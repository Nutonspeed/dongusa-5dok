import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, analysisType = "comprehensive" } = await request.json()

    if (!imageUrl) {
      return new Response("Image URL is required", { status: 400 })
    }

    // Deterministic mock without external AI dependency
    const base = {
      imageUrl,
      generatedAt: new Date().toISOString(),
      mocked: true,
    }

    let analysis: any
    if (analysisType === "pattern") {
      analysis = {
        type: "pattern",
        category: "เรขาคณิต",
        complexity: "ปานกลาง",
        direction: "แนวตั้ง",
        scale: "กลาง",
        suitability: "เหมาะกับห้องนั่งเล่นสมัยใหม่",
      }
    } else if (analysisType === "color") {
      analysis = {
        type: "color",
        primary: "น้ำเงินเข้ม",
        secondary: "เทาอ่อน",
        tone: "เย็น",
        brightness: "กลาง",
        saturation: "ปานกลาง",
        pairing: "เข้ากับไม้โทนอ่อนและผนังสีขาว",
      }
    } else if (analysisType === "style") {
      analysis = {
        type: "style",
        design: "โมเดิร์น",
        room_fit: ["ห้องนั่งเล่น", "สตูดิโอ"] ,
        target_audience: ["คนรุ่นใหม่", "คู่แต่งงาน"] ,
        price_hint: "ปานกลาง-พรีเมียม",
        furniture_match: ["โซฟาหนัง", "โต๊ะไม้"] ,
      }
    } else {
      analysis = {
        type: "comprehensive",
        pattern: { category: "ลายเส้น", complexity: "ปานกลาง" },
        color: { primary: "ครีม", tone: "กลาง" },
        style: { design: "มินิมอล", suitability: "เหมาะกับบ้านสมัยใหม่" },
        quality_hint: "ทนทานและดูแลง่าย",
        suggestions: ["ใช้คู่กับหมอนโทนเดียว", "เพิ่มความอบอุ่นด้วยผ้าคลุมสีตัด"] ,
        target_price: "$$$",
      }
    }

    return Response.json({
      analysis,
      analysisType,
      ...base,
    })
  } catch (error) {
    console.error("Error analyzing fabric:", error)
    return new Response("Failed to analyze fabric", { status: 500 })
  }
}
