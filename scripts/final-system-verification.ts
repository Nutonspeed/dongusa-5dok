import { createClient } from "@supabase/supabase-js"

async function verifySystemStatus() {
  console.log("[v0] เริ่มการตรวจสอบระบบทั้งหมด...")

  const results = {
    database: false,
    authentication: false,
    adminAccess: false,
    redis: false,
    environmentVars: false,
    issues: [] as string[],
    recommendations: [] as string[],
  }

  try {
    // 1. ตรวจสอบ Environment Variables
    console.log("[v0] ตรวจสอบ Environment Variables...")
    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "KV_REST_API_URL",
      "KV_REST_API_TOKEN",
    ]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
    if (missingVars.length === 0) {
      results.environmentVars = true
      console.log("[v0] ✅ Environment Variables ครบถ้วน")
    } else {
      results.issues.push(`ขาด Environment Variables: ${missingVars.join(", ")}`)
      console.log("[v0] ❌ ขาด Environment Variables:", missingVars)
    }

    // 2. ตรวจสอบการเชื่อมต่อ Supabase
    console.log("[v0] ตรวจสอบการเชื่อมต่อ Supabase...")
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // ทดสอบการเชื่อมต่อฐานข้อมูล
      const { data: healthCheck, error: healthError } = await supabase.from("profiles").select("count").limit(1)

      if (!healthError) {
        results.database = true
        console.log("[v0] ✅ การเชื่อมต่อฐานข้อมูล Supabase ทำงานปกติ")

        // ตรวจสอบผู้ใช้ nuttapong161@gmail.com
        const { data: userProfile, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", "nuttapong161@gmail.com")
          .single()

        if (!userError && userProfile) {
          console.log("[v0] ✅ พบข้อมูลผู้ใช้ nuttapong161@gmail.com")
          console.log("[v0] สถานะผู้ใช้:", {
            id: userProfile.id,
            email: userProfile.email,
            role: userProfile.role,
            is_admin: userProfile.is_admin,
          })

          if (userProfile.is_admin || userProfile.role === "admin") {
            results.adminAccess = true
            console.log("[v0] ✅ ผู้ใช้มีสิทธิ์แอดมิน")
          } else {
            results.issues.push("ผู้ใช้ nuttapong161@gmail.com ไม่มีสิทธิ์แอดมิน")
            results.recommendations.push("อัพเดทสิทธิ์แอดมินสำหรับผู้ใช้ nuttapong161@gmail.com")
          }
        } else {
          results.issues.push("ไม่พบข้อมูลผู้ใช้ nuttapong161@gmail.com ในฐานข้อมูล")
          results.recommendations.push("สร้างบัญชีผู้ใช้ nuttapong161@gmail.com พร้อมสิทธิ์แอดมิน")
        }

        // ตรวจสอบ Authentication
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userProfile?.id || "")
        if (!authError && authUser) {
          results.authentication = true
          console.log("[v0] ✅ ระบบ Authentication ทำงานปกติ")
        }
      } else {
        results.issues.push(`ข้อผิดพลาดการเชื่อมต่อฐานข้อมูล: ${healthError.message}`)
        console.log("[v0] ❌ ข้อผิดพลาดการเชื่อมต่อฐานข้อมูล:", healthError.message)
      }
    } else {
      results.issues.push("ขาด Supabase configuration")
    }

    // 3. ตรวจสอบ Redis (Upstash KV)
    console.log("[v0] ตรวจสอบการเชื่อมต่อ Redis...")
    const kvUrl = process.env.KV_REST_API_URL
    const kvToken = process.env.KV_REST_API_TOKEN

    if (kvUrl && kvToken) {
      try {
        const response = await fetch(`${kvUrl}/ping`, {
          headers: {
            Authorization: `Bearer ${kvToken}`,
          },
        })

        if (response.ok) {
          results.redis = true
          console.log("[v0] ✅ การเชื่อมต่อ Redis ทำงานปกติ")
        } else {
          results.issues.push(`Redis connection failed: ${response.status}`)
        }
      } catch (error) {
        results.issues.push(`Redis connection error: ${error}`)
      }
    } else {
      results.issues.push("ขาด Redis (KV) configuration")
    }
  } catch (error) {
    console.error("[v0] ข้อผิดพลาดในการตรวจสอบระบบ:", error)
    results.issues.push(`System verification error: ${error}`)
  }

  // สรุปผลการตรวจสอบ
  console.log("\n" + "=".repeat(60))
  console.log("📋 รายงานสถานะระบบ")
  console.log("=".repeat(60))

  console.log("\n✅ ส่วนที่ทำงานปกติ:")
  if (results.environmentVars) console.log("  - Environment Variables")
  if (results.database) console.log("  - การเชื่อมต่อฐานข้อมูล Supabase")
  if (results.authentication) console.log("  - ระบบ Authentication")
  if (results.adminAccess) console.log("  - สิทธิ์การเข้าถึงแอดมิน")
  if (results.redis) console.log("  - การเชื่อมต่อ Redis")

  if (results.issues.length > 0) {
    console.log("\n❌ ปัญหาที่พบ:")
    results.issues.forEach((issue) => console.log(`  - ${issue}`))
  }

  if (results.recommendations.length > 0) {
    console.log("\n💡 ข้อเสนอแนะ:")
    results.recommendations.forEach((rec) => console.log(`  - ${rec}`))
  }

  const overallStatus = results.database && results.authentication && results.environmentVars
  console.log(`\n🎯 สถานะระบบโดยรวม: ${overallStatus ? "✅ พร้อมใช้งาน" : "❌ ต้องแก้ไข"}`)

  return results
}

// รันการตรวจสอบ
verifySystemStatus().catch(console.error)
