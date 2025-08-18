console.log("🔧 คู่มือการตั้งค่า Environment Variables สำหรับ ELF SofaCover Pro")
console.log("=".repeat(80))

// ตรวจสอบ environment variables ที่มีอยู่
const requiredVars = {
  // ฐานข้อมูล Supabase (จำเป็น)
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // การตั้งค่าพื้นฐาน (แนะนำ)
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  QA_BYPASS_AUTH: process.env.QA_BYPASS_AUTH,

  // อีเมล (สำหรับส่งการแจ้งเตือน)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // การจัดเก็บไฟล์
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
}

const optionalVars = {
  // ฟีเจอร์เสริม
  ENABLE_CUSTOM_COVERS: process.env.ENABLE_CUSTOM_COVERS,
  ENABLE_REVIEWS: process.env.ENABLE_REVIEWS,
  ENABLE_WISHLIST: process.env.ENABLE_WISHLIST,

  // การชำระเงิน
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  PROMPTPAY_ID: process.env.PROMPTPAY_ID,

  // AI และ Analytics
  XAI_API_KEY: process.env.XAI_API_KEY,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
}

console.log("\n📋 สถานะ Environment Variables ที่จำเป็น:")
console.log("-".repeat(50))

let missingRequired = 0
let totalRequired = 0

for (const [key, value] of Object.entries(requiredVars)) {
  totalRequired++
  const status = value ? "✅ ตั้งค่าแล้ว" : "❌ ยังไม่ได้ตั้งค่า"
  const displayValue = value ? `(${value.substring(0, 20)}...)` : ""
  console.log(`${key}: ${status} ${displayValue}`)

  if (!value) missingRequired++
}

console.log("\n📋 สถานะ Environment Variables เสริม:")
console.log("-".repeat(50))

for (const [key, value] of Object.entries(optionalVars)) {
  const status = value ? "✅ ตั้งค่าแล้ว" : "⚪ ยังไม่ได้ตั้งค่า (ไม่บังคับ)"
  const displayValue = value ? `(${value.substring(0, 20)}...)` : ""
  console.log(`${key}: ${status} ${displayValue}`)
}

console.log("\n" + "=".repeat(80))
console.log("📊 สรุปสถานะ:")
console.log(`✅ ตั้งค่าแล้ว: ${totalRequired - missingRequired}/${totalRequired} ตัวแปรที่จำเป็น`)
console.log(`❌ ยังไม่ได้ตั้งค่า: ${missingRequired} ตัวแปร`)

if (missingRequired === 0) {
  console.log("\n🎉 ยินดีด้วย! ระบบพร้อมใช้งานแล้ว")
} else {
  console.log("\n⚠️  ต้องตั้งค่าตัวแปรที่ขาดหายก่อนใช้งาน")
}

console.log("\n" + "=".repeat(80))
console.log("📖 คำอธิบาย CUSTOM_KEY:")
console.log("CUSTOM_KEY เป็นเพียง placeholder (ตัวอย่าง) ที่ไม่จำเป็นต้องตั้งค่า")
console.log("ระบบจะทำงานได้ปกติโดยไม่ต้องมี CUSTOM_KEY")
console.log("ตัวแปรที่สำคัญจริงๆ คือ Supabase credentials ที่คุณได้ให้มาแล้ว")

console.log("\n📝 วิธีการตั้งค่า Environment Variables:")
console.log("1. ไปที่ Project Settings ใน Vercel Dashboard")
console.log("2. เลือกแท็บ Environment Variables")
console.log("3. เพิ่มตัวแปรที่ขาดหายตามรายการข้างต้น")
console.log("4. กด Save และ Redeploy โปรเจกต์")

console.log("\n🔧 ตัวอย่างค่าที่แนะนำ:")
console.log("QA_BYPASS_AUTH=1 (สำหรับการทดสอบ)")
console.log("NEXT_PUBLIC_APP_NAME=ELF SofaCover Pro")
console.log("ENABLE_CUSTOM_COVERS=true")
console.log("ENABLE_REVIEWS=true")
console.log("ENABLE_WISHLIST=true")

console.log("\n✅ หลังจากตั้งค่าเสร็จแล้ว รัน script นี้อีกครั้งเพื่อตรวจสอบ")
