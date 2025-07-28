// Security audit runner script

import { securityScanner } from "@/lib/security-audit"
import fs from "fs"
import path from "path"

async function runSecurityAudit() {
  console.log("🔒 Starting comprehensive security audit...")

  const baseUrl = process.env.BASE_URL || "http://localhost:3000"

  try {
    // Perform full security scan
    const scanResults = await securityScanner.performFullScan(baseUrl)

    // Generate report
    const report = securityScanner.generateSecurityReport(scanResults)

    // Save report to file
    const reportPath = path.join(process.cwd(), "security-audit-report.md")
    fs.writeFileSync(reportPath, report)

    console.log(`✅ Security audit completed. Report saved to: ${reportPath}`)
    console.log(`📊 Overall Security Score: ${scanResults.auditReport.overallScore}/100`)

    // Exit with error code if critical vulnerabilities found
    const criticalVulns = scanResults.auditReport.vulnerabilities.filter((v) => v.severity === "critical")

    if (criticalVulns.length > 0) {
      console.error(`❌ ${criticalVulns.length} critical vulnerabilities found!`)
      process.exit(1)
    }

    const highVulns = scanResults.auditReport.vulnerabilities.filter((v) => v.severity === "high")

    if (highVulns.length > 0) {
      console.warn(`⚠️ ${highVulns.length} high severity vulnerabilities found!`)
    }
  } catch (error) {
    console.error("❌ Security audit failed:", error)
    process.exit(1)
  }
}

// Run audit if called directly
if (require.main === module) {
  runSecurityAudit()
}

export { runSecurityAudit }
