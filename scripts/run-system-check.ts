import { createClient } from "@/lib/supabase/client"

async function checkSupabaseConnection() {
  console.log("🔍 ตรวจสอบการเชื่อมต่อ Supabase...")

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.log("⚠️  Supabase เชื่อมต่อได้แต่อาจมีปัญหากับตาราง:", error.message)
      return false
    }

    console.log("✅ Supabase เชื่อมต่อสำเร็จ")
    return true
  } catch (error) {
    console.log("❌ ไม่สามารถเชื่อมต่อ Supabase:", error)
    return false
  }
}

async function checkEnvironmentVariables() {
  console.log("🔍 ตรวจสอบ Environment Variables...")

  const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.log("❌ Environment Variables ที่ขาดหายไป:", missing.join(", "))
    return false
  }

  console.log("✅ Environment Variables ครบถ้วน")
  return true
}

async function generateSystemReport() {
  console.log("📊 สร้างรายงานสถานะระบบ...\n")

  const envCheck = await checkEnvironmentVariables()
  const supabaseCheck = await checkSupabaseConnection()

  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      status: envCheck ? "OK" : "ERROR",
      variables: envCheck,
    },
    database: {
      status: supabaseCheck ? "OK" : "ERROR",
      connection: supabaseCheck,
    },
    overall: envCheck && supabaseCheck ? "HEALTHY" : "NEEDS_ATTENTION",
  }

  console.log("\n📋 สรุปรายงาน:")
  console.log(`- Environment Variables: ${report.environment.status}`)
  console.log(`- Database Connection: ${report.database.status}`)
  console.log(`- สถานะรวม: ${report.overall}`)

  return report
}

async function main() {
  console.log("🚀 เริ่มตรวจสอบสถานะระบบ ELF SofaCover Pro\n")

  try {
    const report = await generateSystemReport()

    console.log("\n" + "=".repeat(60))
    console.log("📋 รายงานสถานะระบบเสร็จสิ้น")
    console.log("=".repeat(60))

    return report
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการตรวจสอบระบบ:", error)
    throw error
  }
}

main().catch(console.error)
