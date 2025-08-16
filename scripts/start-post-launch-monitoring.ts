import PostLaunchMonitoring from "./post-launch-monitoring"

async function startPostLaunchSupport() {
  console.log("🔍 เริ่มต้น Post-Launch Support และ Monitoring")
  console.log("=".repeat(60))

  try {
    // Initialize monitoring system
    const monitoring = new PostLaunchMonitoring()

    console.log("📊 กำลังเริ่มระบบ monitoring...")
    await monitoring.startMonitoring()

    console.log("\n✅ Post-Launch Monitoring เริ่มทำงานแล้ว")
    console.log("📈 ระบบจะติดตามสถานะต่อไปนี้:")
    console.log("  • Site uptime และ response time")
    console.log("  • Database และ API health")
    console.log("  • Performance metrics")
    console.log("  • Business KPIs")
    console.log("  • Error rates และ alerts")

    // Set up graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n🛑 กำลังปิดระบบ monitoring...")
      await monitoring.stopMonitoring()
      await monitoring.generateDailyReport()
      console.log("✅ ระบบ monitoring ปิดเรียบร้อยแล้ว")
      process.exit(0)
    })

    // Generate initial report after 5 minutes
    setTimeout(async () => {
      console.log("📊 กำลังสร้างรายงานเริ่มต้น...")
      await monitoring.generateDailyReport()
    }, 300000) // 5 minutes

    console.log("\n🎯 ขั้นตอนถัดไป:")
    console.log("  1. ติดตามระบบอย่างต่อเนื่อง")
    console.log("  2. แก้ไข bugs ที่พบ")
    console.log("  3. รวบรวม user feedback")
    console.log("  4. ปรับปรุงประสิทธิภาพ")

    // Keep the process running
    console.log("\n⏰ ระบบ monitoring กำลังทำงาน... (กด Ctrl+C เพื่อหยุด)")
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการเริ่ม monitoring:", error)
    process.exit(1)
  }
}

// รัน post-launch support
startPostLaunchSupport()
