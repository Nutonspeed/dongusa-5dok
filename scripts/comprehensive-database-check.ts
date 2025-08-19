import { createClient } from "@supabase/supabase-js"

console.log("[v0] เริ่มการตรวจสอบระบบฐานข้อมูลแบบครบวงจร...")

async function runComprehensiveDatabaseCheck() {
  const results = {
    supabaseConnection: false,
    databaseTables: [],
    authenticationTest: false,
    adminAccess: false,
    environmentVariables: {},
    errors: [],
    recommendations: [],
  }

  try {
    // 1. ตรวจสอบ Environment Variables
    console.log("[v0] ตรวจสอบ Environment Variables...")
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      results.environmentVariables[envVar] = value ? "✅ พร้อมใช้งาน" : "❌ ไม่พบ"
      if (!value) {
        results.errors.push(`Environment Variable ${envVar} ไม่พบ`)
      }
    }

    // 2. ทดสอบการเชื่อมต่อ Supabase
    console.log("[v0] ทดสอบการเชื่อมต่อ Supabase...")
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      // ทดสอบการเชื่อมต่อด้วยการดึงข้อมูล metadata
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        console.log("[v0] ข้อผิดพลาดการเชื่อมต่อ:", error.message)
        results.errors.push(`Supabase Connection Error: ${error.message}`)
      } else {
        results.supabaseConnection = true
        console.log("[v0] การเชื่อมต่อ Supabase สำเร็จ")
      }

      // 3. ตรวจสอบ Database Schema
      console.log("[v0] ตรวจสอบ Database Schema...")
      const tables = [
        "profiles",
        "products",
        "categories",
        "orders",
        "order_items",
        "cart_items",
        "reviews",
        "coupons",
        "fabric_collections",
        "fabrics",
      ]

      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select("*").limit(1)
          if (error) {
            results.errors.push(`Table ${table}: ${error.message}`)
          } else {
            results.databaseTables.push(`${table} ✅`)
          }
        } catch (err) {
          results.errors.push(`Table ${table}: ${err.message}`)
        }
      }

      // 4. ทดสอบ Authentication
      console.log("[v0] ทดสอบระบบ Authentication...")
      try {
        // ตรวจสอบว่าสามารถดึงข้อมูล user ได้หรือไม่
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.log("[v0] Authentication test - ไม่มี active session (ปกติสำหรับ server-side)")
        }

        // ทดสอบการดึงข้อมูล profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("email, role")
          .eq("email", "nuttapong161@gmail.com")
          .single()

        if (profileError) {
          results.errors.push(`Profile check error: ${profileError.message}`)
        } else if (profileData) {
          results.authenticationTest = true
          results.adminAccess = profileData.role === "admin"
          console.log("[v0] พบข้อมูลผู้ใช้:", profileData.email, "Role:", profileData.role)
        }
      } catch (authErr) {
        results.errors.push(`Authentication test error: ${authErr.message}`)
      }
    } else {
      results.errors.push("ไม่พบ Supabase environment variables")
    }

    // 5. สร้างรายงานและข้อเสนอแนะ
    console.log("\n" + "=".repeat(60))
    console.log("📊 รายงานการตรวจสอบระบบฐานข้อมูล")
    console.log("=".repeat(60))

    console.log("\n🔧 Environment Variables:")
    Object.entries(results.environmentVariables).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`)
    })

    console.log(`\n🔗 การเชื่อมต่อ Supabase: ${results.supabaseConnection ? "✅ สำเร็จ" : "❌ ล้มเหลว"}`)

    console.log("\n📋 Database Tables:")
    if (results.databaseTables.length > 0) {
      results.databaseTables.forEach((table) => console.log(`  ${table}`))
    } else {
      console.log("  ❌ ไม่พบตารางในฐานข้อมูล")
    }

    console.log(`\n🔐 Authentication Test: ${results.authenticationTest ? "✅ สำเร็จ" : "❌ ล้มเหลว"}`)
    console.log(`\n👑 Admin Access: ${results.adminAccess ? "✅ มีสิทธิ์แอดมิน" : "❌ ไม่มีสิทธิ์แอดมิน"}`)

    if (results.errors.length > 0) {
      console.log("\n❌ ปัญหาที่พบ:")
      results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`)
      })
    }

    // ข้อเสนอแนะ
    console.log("\n💡 ข้อเสนอแนะ:")

    if (!results.supabaseConnection) {
      console.log("  1. ตรวจสอบ Supabase URL และ API Key")
      console.log("  2. ยืนยันว่า Supabase project ยังคงใช้งานได้")
    }

    if (!results.authenticationTest) {
      console.log("  3. ตรวจสอบการตั้งค่า Row Level Security")
      console.log("  4. ยืนยันว่าผู้ใช้ nuttapong161@gmail.com มีอยู่ในฐานข้อมูล")
    }

    if (!results.adminAccess) {
      console.log("  5. อัพเดท role ของผู้ใช้เป็น 'admin' ในตาราง profiles")
    }

    if (results.databaseTables.length < 10) {
      console.log("  6. รันสคริปต์ setup-complete-database.sql เพื่อสร้างตารางที่ขาดหายไป")
    }

    console.log("\n" + "=".repeat(60))
    console.log("✅ การตรวจสอบเสร็จสิ้น")
    console.log("=".repeat(60))

    return results
  } catch (error) {
    console.error("[v0] ข้อผิดพลาดในการตรวจสอบระบบ:", error)
    results.errors.push(`System check error: ${error.message}`)
    return results
  }
}

// รันการตรวจสอบ
runComprehensiveDatabaseCheck()
  .then((results) => {
    console.log("[v0] การตรวจสอบระบบเสร็จสิ้น")

    // สรุปสถานะ
    const isHealthy =
      results.supabaseConnection &&
      results.authenticationTest &&
      results.databaseTables.length >= 8 &&
      results.errors.length === 0

    console.log(`\n🏥 สถานะระบบโดยรวม: ${isHealthy ? "✅ สุขภาพดี" : "⚠️ ต้องการการแก้ไข"}`)

    if (!isHealthy) {
      console.log("\n🔧 การดำเนินการที่แนะนำ:")
      console.log("1. แก้ไขปัญหาที่พบตามรายการข้างต้น")
      console.log("2. รันสคริปต์นี้อีกครั้งเพื่อยืนยันการแก้ไข")
      console.log("3. ทดสอบการล็อกอินผ่าน UI")
    }
  })
  .catch((error) => {
    console.error("[v0] ข้อผิดพลาดร้ายแรง:", error)
  })
