# 🔗 คู่มือการเชื่อมต่อ Facebook Messenger Integration

## 📋 ภาพรวมระบบ

ระบบ SofaCover Pro มีการเชื่อมต่อกับ Facebook Messenger เพื่อ:
- **ส่งลายผ้า** จากแกลเลอรี่ไปยัง Messenger อัตโนมัติ
- **ส่งบิล/ใบเสร็จ** ให้ลูกค้าผ่าน Messenger
- **ติดตาม Conversion** และ Pixel สำหรับโฆษณา Facebook
- **เตรียมพร้อมสำหรับ Facebook API** ในอนาคต

## 🛠️ การตั้งค่าเบื้องต้น

### 1. Environment Variables ที่จำเป็น

เพิ่ม Environment Variables เหล่านี้ใน Vercel Project Settings:

\`\`\`bash
# Facebook Page Configuration
FACEBOOK_PAGE_ID=your-facebook-page-id
FACEBOOK_ACCESS_TOKEN=your-page-access-token
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# Facebook Pixel (สำหรับโฆษณา)
FACEBOOK_PIXEL_ID=your-pixel-id

# Optional: API Version
FACEBOOK_API_VERSION=18.0
\`\`\`

### 2. วิธีการหา Facebook Page ID

1. ไปที่ Facebook Page ของคุณ
2. คลิก **About** ในเมนูซ้าย
3. เลื่อนลงไปหา **Page ID** หรือ
4. ดูใน URL: `facebook.com/your-page-name` → Page ID จะอยู่ใน Page Info

**หรือใช้วิธีง่ายๆ:**
\`\`\`
https://findmyfbid.com/
\`\`\`

### 3. วิธีการสร้าง Access Token (สำหรับอนาคต)

**ขั้นตอนเมื่อพร้อมใช้ Facebook API:**

1. ไปที่ [Facebook Developers](https://developers.facebook.com/)
2. สร้าง **Facebook App** ใหม่
3. เพิ่ม **Messenger** product
4. ไปที่ **Messenger > Settings**
5. สร้าง **Page Access Token**
6. คัดลอก Token มาใส่ใน Environment Variables

### 4. วิธีการสร้าง Facebook Pixel

1. ไปที่ [Facebook Business Manager](https://business.facebook.com/)
2. เลือก **Events Manager**
3. คลิก **Connect Data Sources > Web**
4. เลือก **Facebook Pixel**
5. ตั้งชื่อ Pixel และใส่ Website URL
6. คัดลอก **Pixel ID** มาใส่ใน Environment Variables

## 🎯 ฟีเจอร์ที่พร้อมใช้งาน

### 1. ระบบส่งลายผ้าไปยัง Messenger

**การใช้งาน:**
- ลูกค้าเข้าไปที่ Fabric Gallery
- เลือกลายผ้าที่ต้องการ
- คลิก **"ส่งไปยัง Messenger"**
- ระบบจะเปิด Messenger พร้อมข้อความที่จัดรูปแบบแล้ว

**ข้อความที่ส่งจะมี:**
\`\`\`
🎨 ลายผ้าที่เลือก: ลายดอกไม้สีฟ้า

📁 คอลเลกชัน: Classic Collection
💰 ราคา: 1,500-2,000 บาท

สนใจสั่งทำผ้าคลุมโซฟาลายนี้ครับ/ค่ะ

กรุณาแจ้งขนาดโซฟาและรายละเอียดเพิ่มเติมด้วยครับ/ค่ะ
\`\`\`

### 2. ระบบส่งบิลผ่าน Messenger

**การใช้งาน:**
- Admin สร้างบิลในระบบ
- คลิก **"ส่งไปยัง Messenger"** หรือ **"คัดลอกลิงก์"**
- ระบบจะสร้างข้อความพร้อมลิงก์บิล

**ข้อความบิลจะมี:**
\`\`\`
🧾 ใบเสร็จ/บิล

👤 ลูกค้า: คุณสมชาย ใจดี
💰 ยอดรวม: 2,500 บาท

🔗 ดูรายละเอียดบิล: https://yoursite.com/bill/view/BILL-001

กรุณาตรวจสอบรายละเอียดและดำเนินการชำระเงินครับ/ค่ะ
\`\`\`

### 3. ระบบติดตาม Conversion และ Pixel

**Events ที่ติดตาม:**
- `fabric_view` - ดูลายผ้า
- `fabric_select` - เลือกลายผ้าส่งไป Messenger
- `quote_request` - ขอใบเสนอราคา
- `bill_view` - ดูบิล
- `bill_share` - แชร์บิล
- `purchase` - ซื้อสินค้า

**Facebook Pixel Events:**
- `ViewContent` - เมื่อดูสินค้าหรือบิล
- `AddToCart` - เมื่อเลือกลายผ้า
- `InitiateCheckout` - เมื่อขอใบเสนอราคา
- `Purchase` - เมื่อซื้อสินค้า

## 📊 การใช้งานระบบ Analytics

### 1. ดูข้อมูล Conversion Events

\`\`\`javascript
// ดูข้อมูลทั้งหมด
GET /api/analytics/conversion

// กรองตาม event type
GET /api/analytics/conversion?type=fabric_select

// กรองตาม session
GET /api/analytics/conversion?session=session_123

// กรองตามช่วงเวลา
GET /api/analytics/conversion?start=2025-01-01&end=2025-01-31
\`\`\`

### 2. ข้อมูลที่ได้จาก API

\`\`\`json
{
  "events": [
    {
      "eventType": "fabric_select",
      "sessionId": "session_123",
      "timestamp": "2025-01-15T10:30:00Z",
      "data": {
        "fabricId": "fabric_001",
        "fabricName": "ลายดอกไม้สีฟ้า",
        "collectionName": "Classic Collection",
        "source": "gallery"
      }
    }
  ],
  "total": 1,
  "summary": {
    "fabric_views": 150,
    "fabric_selects": 45,
    "quote_requests": 23,
    "bill_views": 12
  }
}
\`\`\`

## 🔧 การปรับแต่งระบบ

### 1. ปรับแต่งข้อความ Messenger

แก้ไขไฟล์ `lib/messenger-integration.ts`:

\`\`\`typescript
// ปรับแต่งข้อความลายผ้า
private formatFabricMessage(selection: FabricSelection): string {
  return `🎨 ลายผ้าที่เลือก: ${selection.fabricName}

📁 คอลเลกชัน: ${selection.collectionName}
💰 ราคา: ${selection.price}

${selection.customerMessage || "ข้อความที่คุณต้องการ"}

ข้อความเพิ่มเติม...`
}
\`\`\`

### 2. เพิ่ม Custom Conversion Events

\`\`\`typescript
// ในไฟล์ component ของคุณ
import { conversionTracker } from '@/lib/conversion-tracking'

// ติดตาม custom event
await conversionTracker.trackEvent({
  eventType: 'custom_event' as any,
  userId: 'user_123',
  sessionId: 'session_456',
  timestamp: new Date(),
  data: {
    customField: 'customValue',
    source: 'your_source'
  }
})
\`\`\`

### 3. ปรับแต่ง Facebook Pixel Events

แก้ไขไฟล์ `lib/conversion-tracking.ts`:

\`\`\`typescript
// เพิ่ม custom pixel event
case 'your_custom_event':
  return {
    eventName: 'CustomEvent',
    parameters: {
      content_type: 'custom',
      custom_data: {
        your_field: event.data.yourField
      }
    }
  }
\`\`\`

## 🚀 การเตรียมพร้อมสำหรับ Facebook API

### 1. Webhook Setup (สำหรับอนาคต)

สร้างไฟล์ `app/api/webhook/facebook/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import { messengerService } from '@/lib/messenger-integration'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge)
  }

  return new Response('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-hub-signature-256')

  if (!messengerService.verifyWebhookSignature(signature || '', body)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const data = JSON.parse(body)
  
  // Process incoming messages
  for (const entry of data.entry) {
    for (const messaging of entry.messaging) {
      if (messaging.message) {
        // Handle incoming message
        await handleIncomingMessage(messaging)
      }
    }
  }

  return NextResponse.json({ status: 'ok' })
}
\`\`\`

### 2. Auto-Reply System (สำหรับอนาคต)

\`\`\`typescript
async function handleIncomingMessage(messaging: any) {
  const senderId = messaging.sender.id
  const messageText = messaging.message.text

  // Auto-reply logic
  if (messageText.includes('ราคา') || messageText.includes('price')) {
    await messengerService.sendDirectMessage(
      senderId,
      'สวัสดีครับ/ค่ะ! สำหรับราคาผ้าคลุมโซฟา กรุณาแจ้งขนาดโซฟาและลายผ้าที่ต้องการ เราจะแจ้งราคาให้ทันทีครับ/ค่ะ'
    )
  }
}
\`\`\`

## 📱 การทดสอบระบบ

### 1. ทดสอบการส่งลายผ้า

1. เข้าไปที่ `/fabric-gallery`
2. เลือกลายผ้าใดๆ
3. คลิก **"ส่งไปยัง Messenger"**
4. ตรวจสอบว่า Messenger เปิดขึ้นพร้อมข้อความ

### 2. ทดสอบการส่งบิล

1. เข้าไปที่ `/admin/bills`
2. สร้างบิลใหม่หรือเลือกบิลที่มีอยู่
3. คลิก **"ส่งไปยัง Messenger"**
4. ตรวจสอบข้อความและลิงก์บิล

### 3. ทดสอบ Conversion Tracking

1. เปิด Developer Tools (F12)
2. ไปที่ tab **Console**
3. ดูข้อความ log เมื่อมีการ track events
4. ตรวจสอบ Local Storage สำหรับ `conversion_events`

## 🔍 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

**1. Messenger ไม่เปิด**
- ตรวจสอบ `FACEBOOK_PAGE_ID` ใน Environment Variables
- ลองใช้ Page Username แทน Page ID

**2. Facebook Pixel ไม่ทำงาน**
- ตรวจสอบ `FACEBOOK_PIXEL_ID`
- ติดตั้ง Facebook Pixel Helper Extension
- ตรวจสอบ Console สำหรับ errors

**3. Conversion Events ไม่บันทึก**
- ตรวจสอบ Network tab ใน Developer Tools
- ดู Console สำหรับ JavaScript errors
- ตรวจสอบ API endpoint `/api/analytics/conversion`

### การ Debug

\`\`\`javascript
// เปิด debug mode สำหรับ conversion tracking
localStorage.setItem('debug_conversion', 'true')

// ดู events ที่บันทึกไว้
console.log(JSON.parse(localStorage.getItem('conversion_events') || '[]'))

// ทดสอบ Facebook Pixel
if (window.fbq) {
  fbq('track', 'PageView')
  console.log('Facebook Pixel is working')
}
\`\`\`

## 📈 การวิเคราะห์ผลลัพธ์

### KPIs ที่ควรติดตาม

1. **Fabric Engagement Rate** = (fabric_selects / fabric_views) × 100
2. **Quote Conversion Rate** = (quote_requests / fabric_selects) × 100
3. **Bill View Rate** = (bill_views / bills_sent) × 100
4. **Messenger Response Rate** = (responses / messages_sent) × 100

### รายงานประจำสัปดาห์

\`\`\`sql
-- ตัวอย่าง Query สำหรับรายงาน
SELECT 
  DATE(timestamp) as date,
  eventType,
  COUNT(*) as count,
  COUNT(DISTINCT sessionId) as unique_sessions
FROM conversion_events 
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(timestamp), eventType
ORDER BY date DESC, count DESC
\`\`\`

---

**ระบบ Facebook Messenger Integration พร้อมใช้งานและสามารถขยายเพิ่มเติมได้ตามความต้องการ**

*อัปเดตล่าสุด: มกราคม 2025*
