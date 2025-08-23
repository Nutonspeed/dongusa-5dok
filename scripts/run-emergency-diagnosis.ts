import { EmergencySystemDiagnosis } from "./emergency-system-diagnosis"

async function runDiagnosis() {
  console.log("🚀 Starting Emergency System Diagnosis...")
  console.log("This will identify all critical issues causing system failures.\n")

  const diagnosis = new EmergencySystemDiagnosis()
  const result = await diagnosis.runEmergencyDiagnosis()

  console.log("\n📊 DIAGNOSIS SUMMARY:")
  console.log(`System Status: ${result.overall}`)
  console.log(`Critical Issues: ${result.issues.filter((i) => i.severity === "critical").length}`)
  console.log(`High Priority Issues: ${result.issues.filter((i) => i.severity === "high").length}`)
  console.log(`Total Issues: ${result.issues.length}`)

  if (result.overall === "failed") {
    console.log("\n🚨 SYSTEM IS COMPLETELY FAILED - IMMEDIATE ACTION REQUIRED")
    console.log("Please address all critical issues before attempting to start the system.")
  } else if (result.overall === "critical") {
    console.log("\n⚠️  SYSTEM IS IN CRITICAL STATE - URGENT ACTION REQUIRED")
    console.log("Core functionality is compromised. Address high priority issues immediately.")
  }

  return result
}

runDiagnosis().catch(console.error)
