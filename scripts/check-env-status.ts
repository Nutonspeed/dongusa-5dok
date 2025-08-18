console.log("🔍 ตรวจสอบสถานะ Environment Variables")
console.log("=".repeat(60))

// ตัวแปรที่จำเป็นสำหรับการทำงานพื้นฐาน
const criticalVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}

// ตัวแปรที่แนะนำสำหรับการทำงานที่ดีขึ้น
const recommendedVars = {
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "ELF SofaCover Pro",
  QA_BYPASS_AUTH: process.env.QA_BYPASS_AUTH || "1",
  ENABLE_CUSTOM_COVERS: process.env.ENABLE_CUSTOM_COVERS || "true",
  ENABLE_REVIEWS: process.env.ENABLE_REVIEWS || "true",
  ENABLE_WISHLIST: process.env.ENABLE_WISHLIST || "true",
}

console.log("📋 ตัวแปรที่จำเป็น (Critical):")
console.log("-".repeat(40))

let missingCritical = 0
for (const [key, value] of Object.entries(criticalVars)) {
  const status = value ? "✅" : "❌"
  const preview = value ? `(${value.substring(0, 30)}...)` : "ไม่ได้ตั้งค่า"
  console.log(`${status} ${key}: ${preview}`)
  if (!value) missingCritical++
}

console.log("\n📋 ตัวแปรที่แนะนำ (Recommended):")
console.log("-".repeat(40))

for (const [key, value] of Object.entries(recommendedVars)) {
  const hasValue = process.env[key]
  const status = hasValue ? "✅" : "⚪"
  const displayValue = hasValue ? value : "ใช้ค่าเริ่มต้น"
  console.log(`${status} ${key}: ${displayValue}`)
}

console.log("\n" + "=".repeat(60))
if (missingCritical === 0) {
  console.log("🎉 ระบบพร้อมใช้งาน! Supabase credentials ครบถ้วน")
  console.log("💡 สามารถเพิ่มตัวแปรแนะนำเพื่อฟีเจอร์เพิ่มเติม")
} else {
  console.log(`❌ ขาดตัวแปรที่จำเป็น ${missingCritical} ตัว`)
  console.log("⚠️  ต้องตั้งค่า Supabase credentials ก่อนใช้งาน")
}

console.log("\n📝 วิธีแก้ไข:")
console.log("1. ไปที่ Vercel Dashboard → Project Settings")
console.log("2. เลือก Environment Variables")
console.log("3. เพิ่มตัวแปรที่ขาดหาย")
console.log("4. Redeploy โปรเจกต์")
