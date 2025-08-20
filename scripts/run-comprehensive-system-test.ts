import { execSync } from "child_process"

console.log("🚀 เริ่มการทดสอบระบบครบถ้วน...\n")

const testScripts = [
  "comprehensive-backend-analysis.ts",
  "database-integration-testing.ts",
  "core-business-features-testing.ts",
  "authentication-security-testing.tsx",
  "performance-monitoring-validation.ts",
]

async function runAllTests() {
  const results = []

  for (const script of testScripts) {
    console.log(`\n📋 กำลังรัน: ${script}`)
    console.log("=".repeat(50))

    try {
      // รันสคริปต์ทดสอบ
      const result = execSync(`npx tsx scripts/${script}`, {
        encoding: "utf8",
        timeout: 60000, // 1 นาที timeout
      })

      console.log(result)
      results.push({
        script,
        status: "SUCCESS",
        output: result,
      })
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดใน ${script}:`, error.message)
      results.push({
        script,
        status: "ERROR",
        error: error.message,
      })
    }
  }

  // สรุปผลการทดสอบ
  console.log("\n" + "=".repeat(60))
  console.log("📊 สรุปผลการทดสอบระบบ")
  console.log("=".repeat(60))

  const successCount = results.filter((r) => r.status === "SUCCESS").length
  const errorCount = results.filter((r) => r.status === "ERROR").length

  console.log(`✅ สำเร็จ: ${successCount}/${testScripts.length}`)
  console.log(`❌ ล้มเหลว: ${errorCount}/${testScripts.length}`)

  if (errorCount > 0) {
    console.log("\n🔍 รายละเอียดข้อผิดพลาด:")
    results
      .filter((r) => r.status === "ERROR")
      .forEach((r) => {
        console.log(`- ${r.script}: ${r.error}`)
      })
  }

  // คำแนะนำขั้นตอนต่อไป
  console.log("\n🎯 ขั้นตอนต่อไป:")
  if (errorCount === 0) {
    console.log("✨ ระบบพร้อมใช้งานแล้ว! สามารถเปิดให้ลูกค้าใช้งานได้")
  } else {
    console.log("🔧 แก้ไขปัญหาที่พบก่อนเปิดใช้งานจริง")
  }

  return results
}

// รันการทดสอบ
runAllTests().catch(console.error)
