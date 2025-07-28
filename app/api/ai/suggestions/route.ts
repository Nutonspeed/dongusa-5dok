import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { type, input } = await request.json()

    let suggestions: any[] = []

    switch (type) {
      case "collection-names":
        suggestions = [
          "Elegant Harmony Collection - คอลเลกชันแห่งความงามที่ลงตัว",
          "Modern Comfort Series - ซีรีส์ความสบายสไตล์โมเดิร์น",
          "Luxury Living Collection - คอลเลกชันการใช้ชีวิตระดับพรีเมียม",
          "Cozy Home Essentials - ของจำเป็นสำหรับบ้านอบอุ่น",
          "Premium Lifestyle Series - ซีรีส์ไลฟ์สไตล์ระดับพรีเมียม",
          "Timeless Classic Collection - คอลเลกชันคลาสสิกเหนือกาลเวลา",
          "Contemporary Chic Series - ซีรีส์ร่วมสมัยที่เก๋ไก๋",
          "Artisan Craft Collection - คอลเลกชันงานฝีมือช่างศิลป์",
        ]
        break

      case "product-description":
        const productName = input || "ผ้าคลุมโซฟา"
        suggestions = [
          `${productName} - ผลิตจากวัสดุคุณภาพสูง ออกแบบเพื่อความทนทานและความสวยงาม เหมาะสำหรับการใช้งานในบ้านที่ต้องการความสะดวกสบายและสไตล์ที่ทันสมัย ดูแลง่าย ทำความสะอาดได้ ใช้งานได้ยาวนาน พร้อมการรับประกันคุณภาพ`,
          `${productName} - นวัตกรรมใหม่ที่ผสมผสานความสวยงามและการใช้งานจริง ด้วยเทคโนโลยีการผลิตที่ทันสมัย วัสดุที่เป็นมิตรกับสิ่งแวดล้อม และการออกแบบที่คำนึงถึงความต้องการของผู้ใช้งานจริง`,
          `${productName} - คุณภาพพรีเมียมที่สัมผัสได้ ด้วยการคัดสรรวัสดุชั้นเลิศ กระบวนการผลิตที่พิถีพิถัน และการควบคุมคุณภาพที่เข้มงวด เพื่อมอบประสบการณ์การใช้งานที่เหนือความคาดหมาย`,
        ]
        break

      case "chat-analysis":
        const chatText = input || ""
        const analysis = analyzeChatContent(chatText)
        suggestions = [analysis]
        break

      case "auto-report":
        const reportType = input || "daily"
        const report = generateAutoReport(reportType)
        suggestions = [report]
        break

      default:
        suggestions = ["ไม่พบประเภทคำขอที่ระบุ"]
    }

    return NextResponse.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating AI suggestions:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate suggestions",
      },
      { status: 500 },
    )
  }
}

function analyzeChatContent(chatText: string) {
  // Mock AI analysis
  const keywords = extractKeywords(chatText)
  const budget = extractBudget(chatText)
  const urgency = extractUrgency(chatText)
  const sofaType = extractSofaType(chatText)

  return `
📊 การวิเคราะห์แชทลูกค้า:

🎯 ความต้องการที่ระบุ:
${keywords.length > 0 ? keywords.map((k) => `- ${k}`).join("\n") : "- ไม่ระบุความต้องการชัดเจน"}

💰 งบประมาณ:
${budget ? `- ${budget} บาท` : "- ไม่ระบุงบประมาณ"}

🛋️ ประเภทโซฟา:
${sofaType ? `- ${sofaType}` : "- ไม่ระบุประเภทโซฟา"}

⚡ ความเร่งด่วน:
${urgency}

💡 สินค้าที่แนะนำ:
- ผ้าคลุมโซฟากำมะหยี่พรีเมียม (฿2,890)
- ผ้าคลุมโซฟาผ้าลินิน (฿2,590)
- ผ้าคลุมโซฟากันน้ำ (฿1,950)

🏷️ แท็กที่แนะนำ:
${generateTags(chatText)
  .map((tag) => `"${tag}"`)
  .join(", ")}

📝 ข้อเสนอแนะ:
- ส่งรูปตัวอย่างสินค้า
- สอบถามขนาดโซฟาที่แน่นอน
- เสนอบริการวัดหน้างาน (หากอยู่ในพื้นที่บริการ)
- แจ้งระยะเวลาการผลิต 7-14 วัน
  `
}

function extractKeywords(text: string): string[] {
  const keywords = []
  if (text.includes("กำมะหยี่") || text.includes("velvet")) keywords.push("ผ้ากำมะหยี่")
  if (text.includes("กันน้ำ") || text.includes("waterproof")) keywords.push("กันน้ำ")
  if (text.includes("ลินิน") || text.includes("linen")) keywords.push("ผ้าลินิน")
  if (text.includes("สีเข้ม") || text.includes("สีดำ")) keywords.push("สีเข้ม")
  if (text.includes("สีอ่อน") || text.includes("สีขาว")) keywords.push("สีอ่อน")
  if (text.includes("ทนทาน") || text.includes("แข็งแรง")) keywords.push("ความทนทาน")
  if (text.includes("นุ่ม") || text.includes("สบาย")) keywords.push("ความนุ่มสบาย")
  return keywords
}

function extractBudget(text: string): string | null {
  const budgetMatch = text.match(/(\d{1,2}[,.]?\d{0,3})\s*(?:บาท|baht|฿)/i)
  if (budgetMatch) {
    return budgetMatch[1].replace(",", "")
  }

  if (text.includes("2-3 พัน") || text.includes("2000-3000")) return "2,000-3,000"
  if (text.includes("3-4 พัน") || text.includes("3000-4000")) return "3,000-4,000"
  if (text.includes("ไม่เกิน 2000")) return "ไม่เกิน 2,000"
  if (text.includes("ไม่เกิน 3000")) return "ไม่เกิน 3,000"

  return null
}

function extractUrgency(text: string): string {
  if (text.includes("รีบ") || text.includes("ด่วน") || text.includes("เร่งด่วน")) {
    return "สูง - ลูกค้าต้องการรีบ"
  }
  if (text.includes("ไม่รีบ") || text.includes("ไม่ด่วน")) {
    return "ต่ำ - ลูกค้าไม่รีบ"
  }
  return "ปานกลาง - ไม่ระบุความเร่งด่วน"
}

function extractSofaType(text: string): string | null {
  if (text.includes("3 ที่นั่ง") || text.includes("3 seater")) return "โซฟา 3 ที่นั่ง"
  if (text.includes("2 ที่นั่ง") || text.includes("2 seater")) return "โซฟา 2 ที่นั่ง"
  if (text.includes("L-shape") || text.includes("เซ็กชั่นแนล")) return "โซฟา L-Shape"
  if (text.includes("เก้าอี้เดี่ยว") || text.includes("single chair")) return "เก้าอี้เดี่ยว"
  return null
}

function generateTags(text: string): string[] {
  const tags = []

  if (text.includes("ลูกค้าใหม่") || !text.includes("เคย")) tags.push("ลูกค้าใหม่")
  if (extractBudget(text)) tags.push(`งบ ${extractBudget(text)}`)
  if (text.includes("รีบ") || text.includes("ด่วน")) tags.push("รีบด่วน")
  if (text.includes("VIP") || text.includes("พิเศษ")) tags.push("VIP")
  if (text.includes("ของขวัญ") || text.includes("gift")) tags.push("ของขวัญ")

  return tags.length > 0 ? tags : ["ลูกค้าทั่วไป"]
}

function generateAutoReport(type: string): string {
  const today = new Date()
  const formatDate = (date: Date) => date.toLocaleDateString("th-TH")

  switch (type) {
    case "daily":
      return `
📊 รายงานประจำวัน - ${formatDate(today)}

💰 ยอดขาย:
- วันนี้: ฿45,230 (+12.5% จากเมื่อวาน)
- เป้าหมายรายวัน: ฿40,000 (เกินเป้า 13.1%)

🛒 คำสั่งซื้อ:
- คำสั่งซื้อใหม่: 23 รายการ
- คำสั่งซื้อที่เสร็จสิ้น: 18 รายการ
- คำสั่งซื้อที่ยกเลิก: 1 รายการ

👥 ลูกค้า:
- ลูกค้าใหม่: 12 ราย
- ลูกค้าเก่าที่กลับมาซื้อ: 11 ราย
- อัตราการกลับมาซื้อ: 48.5%

🏆 สินค้ายอดนิยม:
1. ผ้าคลุมโซฟากำมะหยี่พรีเมียม (15 ชิ้น)
2. ผ้าคลุมโซฟากันน้ำ (12 ชิ้น)
3. หมอนอิงเซ็ต (8 ชิ้น)

⚠️ แจ้งเตือน:
- สินค้า "คลิปยึดผ้า" ใกล้หมด (เหลือ 5 ชิ้น)
- มีคำสั่งซื้อรอชำระเงิน 3 รายการ

💡 ข้อเสนอแนะ:
- เพิ่มสต็อกสินค้ายอดนิยม
- ติดตามลูกค้าที่รอชำระเงิน
- พิจารณาโปรโมชันสำหรับสินค้าที่ขายช้า
      `

    case "weekly":
      return `
📊 รายงานประจำสัปดาห์ - สัปดาห์ที่ ${Math.ceil(today.getDate() / 7)} เดือน ${today.toLocaleDateString("th-TH", { month: "long" })}

💰 สรุปยอดขาย:
- ยอดขายรวม: ฿312,450 (+8.3% จากสัปดาห์ก่อน)
- ยอดขายเฉลี่ยต่อวัน: ฿44,636
- เป้าหมายรายสัปดาห์: ฿280,000 (เกินเป้า 11.6%)

📈 แนวโน้ม:
- วันที่ขายดีที่สุด: วันเสาร์ (฿68,200)
- วันที่ขายน้อยที่สุด: วันอังคาร (฿32,100)
- ช่วงเวลาที่ขายดี: 14:00-18:00 น.

🎯 ผลงานตามเป้าหมาย:
- ยอดขาย: 111.6% ของเป้าหมาย ✅
- จำนวนลูกค้าใหม่: 95.2% ของเป้าหมาย ⚠️
- อัตราการกลับมาซื้อ: 108.3% ของเป้าหมาย ✅

📊 การวิเคราะห์สินค้า:
- สินค้าที่เติบโตเร็วที่สุด: ผ้าคลุมโซฟาลินิน (+25%)
- สินค้าที่ลดลง: น้ำยาทำความสะอาด (-15%)
- สินค้าใหม่ที่น่าสนใจ: ผ้าคลุมโซฟาแบบยืดหยุ่น

💡 แผนสัปดาห์หน้า:
- เปิดตัวคอลเลกชันใหม่ "Summer Breeze"
- จัดโปรโมชัน "ซื้อ 2 ชิ้น ลด 15%"
- เพิ่มการตลาดออนไลน์ในช่วงเย็น
      `

    case "monthly":
      return `
📊 รายงานประจำเดือน - ${today.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}

💰 ภาพรวมทางการเงิน:
- ยอดขายรวม: ฿1,245,680 (+15.2% จากเดือนก่อน)
- กำไรสุทธิ: ฿498,272 (อัตรากำไร 40.0%)
- ต้นทุนสินค้า: ฿622,840
- ค่าใช้จ่ายดำเนินงาน: ฿124,568

📈 การเติบโต:
- เปรียบเทียบเดือนก่อน: +15.2%
- เปรียบเทียบปีก่อน: +28.7%
- เป้าหมายรายเดือน: ฿1,100,000 (เกินเป้า 13.2%)

👥 ฐานลูกค้า:
- ลูกค้าทั้งหมด: 1,247 ราย (+89 ราย)
- ลูกค้าใหม่: 156 ราย
- ลูกค้าที่ซื้อซ้ำ: 68.5%
- ค่าเฉลี่ยต่อคำสั่งซื้อ: ฿2,847

🏆 สินค้าขายดี TOP 5:
1. ผ้าคลุมโซฟากำมะหยี่พรีเมียม - ฿387,450 (31.1%)
2. ผ้าคลุมโซฟากันน้ำ - ฿248,920 (20.0%)
3. ผ้าคลุมโซฟาลินิน - ฿186,690 (15.0%)
4. หมอนอิงเซ็ต - ฿124,460 (10.0%)
5. ผ้าคลุมโซฟาเซ็กชั่นแนล - ฿99,568 (8.0%)

📊 ช่องทางการขาย:
- Facebook: 65.2% (฿812,594)
- เว็บไซต์: 28.3% (฿352,467)
- Line: 4.8% (฿59,794)
- อื่นๆ: 1.7% (฿20,825)

🎯 เป้าหมายเดือนหน้า:
- ยอดขาย: ฿1,350,000 (+8.4%)
- ลูกค้าใหม่: 180 ราย
- เปิดตัวสินค้าใหม่ 3 รายการ
- ขยายช่องทางการขายใน Shopee/Lazada

💡 ข้อเสนอแนะเชิงกลยุทธ์:
- เพิ่มการลงทุนในการตลาดดิจิทัล
- พัฒนาสินค้าในกลุ่ม "Eco-Friendly"
- สร้างโปรแกรมสะสมแต้มสำหรับลูกค้าประจำ
- ขยายทีมฝ่ายผลิตเพื่อรองรับการเติบโต
      `

    default:
      return "ไม่พบประเภทรายงานที่ระบุ"
  }
}
