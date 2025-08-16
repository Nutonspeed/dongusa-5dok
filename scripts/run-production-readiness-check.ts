import { FinalProductionReadinessChecker } from "./final-production-readiness-check"

async function runProductionReadinessCheck() {
  console.log("🚀 เริ่มตรวจสอบความพร้อมสำหรับ Production Deployment")
  console.log("=".repeat(60))

  try {
    const checker = new FinalProductionReadinessChecker()
    await checker.runAllChecks()

    console.log("\n✅ การตรวจสอบเสร็จสิ้น")
    console.log("📋 กรุณาตรวจสอบผลลัพธ์ด้านบนเพื่อดำเนินการต่อไป")
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการตรวจสอบ:", error)
    process.exit(1)
  }
}

// รันการตรวจสอบ
runProductionReadinessCheck()
