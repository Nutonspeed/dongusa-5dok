import { SystemHealthChecker } from "./system-health-check"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

interface AuditResult {
  category: string
  issues: string[]
  recommendations: string[]
  severity: "low" | "medium" | "high" | "critical"
}

class ComprehensiveSystemAudit {
  private auditResults: AuditResult[] = []

  async runFullAudit(): Promise<AuditResult[]> {
    console.log("🔍 Starting comprehensive system audit...\n")

    // Run basic health check first
    const healthChecker = new SystemHealthChecker()
    const healthResults = await healthChecker.runAllChecks()

    // Additional audits
    await this.auditImportExportIssues()
    await this.auditComponentDependencies()
    await this.auditAPIConsistency()
    await this.auditDatabaseIntegrity()
    await this.auditSecurityVulnerabilities()
    await this.auditPerformanceBottlenecks()

    this.printAuditSummary()
    return this.auditResults
  }

  private async auditImportExportIssues() {
    console.log("📦 Auditing import/export issues...")

    const issues: string[] = []
    const recommendations: string[] = []

    // Check for common import issues
    const criticalFiles = [
      "lib/supabase/client.ts",
      "lib/supabase/server.ts",
      "components/crm/CustomerSegmentationDashboard.tsx",
      "lib/marketing-automation.ts",
      "lib/advanced-analytics-service.ts",
    ]

    for (const file of criticalFiles) {
      const filePath = join(process.cwd(), file)
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, "utf-8")

          // Check for missing imports
          if (content.includes("createClient") && !content.includes("@supabase/supabase-js")) {
            issues.push(`${file}: Missing Supabase import`)
          }

          // Check for unused imports
          const importLines = content.split("\n").filter((line) => line.trim().startsWith("import"))
          if (importLines.length > 10) {
            recommendations.push(`${file}: Consider reviewing imports for optimization`)
          }
        } catch (error) {
          issues.push(`${file}: Cannot read file - ${error}`)
        }
      } else {
        issues.push(`${file}: File does not exist`)
      }
    }

    this.addAuditResult(
      "Import/Export Issues",
      issues,
      recommendations,
      issues.length > 3 ? "high" : issues.length > 0 ? "medium" : "low",
    )
  }

  private async auditComponentDependencies() {
    console.log("🧩 Auditing component dependencies...")

    const issues: string[] = []
    const recommendations: string[] = []

    // Check for circular dependencies and missing components
    const componentFiles = [
      "components/fabric/BulkFabricSelector.tsx",
      "components/reporting/CustomReportBuilder.tsx",
      "components/analytics/AdvancedAnalyticsDashboard.tsx",
    ]

    for (const file of componentFiles) {
      if (!existsSync(join(process.cwd(), file))) {
        issues.push(`Missing component: ${file}`)
        recommendations.push(`Create ${file} or remove references to it`)
      }
    }

    this.addAuditResult(
      "Component Dependencies",
      issues,
      recommendations,
      issues.length > 2 ? "high" : issues.length > 0 ? "medium" : "low",
    )
  }

  private async auditAPIConsistency() {
    console.log("🌐 Auditing API consistency...")

    const issues: string[] = []
    const recommendations: string[] = []

    const apiRoutes = [
      "app/api/mobile/batch/route.ts",
      "app/api/reports/download/[executionId]/route.ts",
      "app/api/marketing/campaigns/route.ts",
    ]

    for (const route of apiRoutes) {
      if (!existsSync(join(process.cwd(), route))) {
        issues.push(`Missing API route: ${route}`)
      }
    }

    if (issues.length > 0) {
      recommendations.push("Implement missing API routes or remove references")
      recommendations.push("Consider API versioning strategy")
    }

    this.addAuditResult(
      "API Consistency",
      issues,
      recommendations,
      issues.length > 3 ? "critical" : issues.length > 0 ? "high" : "low",
    )
  }

  private async auditDatabaseIntegrity() {
    console.log("🗄️ Auditing database integrity...")

    const issues: string[] = []
    const recommendations: string[] = []

    // Check for SQL scripts
    const sqlScripts = ["scripts/supabase-performance-indexes.sql", "scripts/database-performance-optimization.sql"]

    for (const script of sqlScripts) {
      if (!existsSync(join(process.cwd(), script))) {
        issues.push(`Missing SQL script: ${script}`)
      }
    }

    if (issues.length > 0) {
      recommendations.push("Create missing database optimization scripts")
      recommendations.push("Run database performance analysis")
    }

    this.addAuditResult(
      "Database Integrity",
      issues,
      recommendations,
      issues.length > 1 ? "high" : issues.length > 0 ? "medium" : "low",
    )
  }

  private async auditSecurityVulnerabilities() {
    console.log("🔒 Auditing security vulnerabilities...")

    const issues: string[] = []
    const recommendations: string[] = []

    // Check middleware
    if (!existsSync(join(process.cwd(), "middleware.ts"))) {
      issues.push("Missing middleware.ts for route protection")
    }

    // Check for environment variable exposure
    const publicFiles = ["app/page.tsx", "app/layout.tsx"]
    for (const file of publicFiles) {
      if (existsSync(join(process.cwd(), file))) {
        const content = readFileSync(join(process.cwd(), file), "utf-8")
        if (content.includes("SUPABASE_SERVICE_ROLE_KEY")) {
          issues.push(`${file}: Service role key exposed in client-side code`)
        }
      }
    }

    if (issues.length > 0) {
      recommendations.push("Implement proper environment variable handling")
      recommendations.push("Add security headers and CSRF protection")
    }

    this.addAuditResult(
      "Security Vulnerabilities",
      issues,
      recommendations,
      issues.some((i) => i.includes("Service role key")) ? "critical" : issues.length > 0 ? "high" : "low",
    )
  }

  private async auditPerformanceBottlenecks() {
    console.log("⚡ Auditing performance bottlenecks...")

    const issues: string[] = []
    const recommendations: string[] = []

    // Check for large bundle sizes
    if (!existsSync(join(process.cwd(), "next.config.mjs"))) {
      issues.push("Missing Next.js configuration for optimization")
    }

    // Check for missing optimization
    const optimizationFiles = ["lib/database-performance-optimizer.ts", "lib/supabase-query-optimizer.ts"]

    for (const file of optimizationFiles) {
      if (!existsSync(join(process.cwd(), file))) {
        issues.push(`Missing optimization service: ${file}`)
      }
    }

    if (issues.length > 0) {
      recommendations.push("Implement database query optimization")
      recommendations.push("Add caching layers and CDN configuration")
      recommendations.push("Enable Next.js performance optimizations")
    }

    this.addAuditResult(
      "Performance Bottlenecks",
      issues,
      recommendations,
      issues.length > 2 ? "high" : issues.length > 0 ? "medium" : "low",
    )
  }

  private addAuditResult(
    category: string,
    issues: string[],
    recommendations: string[],
    severity: "low" | "medium" | "high" | "critical",
  ) {
    this.auditResults.push({ category, issues, recommendations, severity })
  }

  private printAuditSummary() {
    console.log("\n📊 Comprehensive Audit Results:")
    console.log("================================\n")

    const severityIcons = {
      low: "🟢",
      medium: "🟡",
      high: "🟠",
      critical: "🔴",
    }

    this.auditResults.forEach((result) => {
      const icon = severityIcons[result.severity]
      console.log(`${icon} ${result.category} (${result.severity.toUpperCase()})`)

      if (result.issues.length > 0) {
        console.log("  Issues:")
        result.issues.forEach((issue) => console.log(`    - ${issue}`))
      }

      if (result.recommendations.length > 0) {
        console.log("  Recommendations:")
        result.recommendations.forEach((rec) => console.log(`    → ${rec}`))
      }
      console.log()
    })

    const criticalCount = this.auditResults.filter((r) => r.severity === "critical").length
    const highCount = this.auditResults.filter((r) => r.severity === "high").length
    const mediumCount = this.auditResults.filter((r) => r.severity === "medium").length
    const lowCount = this.auditResults.filter((r) => r.severity === "low").length

    console.log(`📈 Summary: ${criticalCount} critical, ${highCount} high, ${mediumCount} medium, ${lowCount} low`)

    if (criticalCount > 0) {
      console.log("\n🚨 CRITICAL ISSUES FOUND! Immediate action required.")
      process.exit(1)
    } else if (highCount > 0) {
      console.log("\n⚠️ High priority issues found. Address before production deployment.")
    } else {
      console.log("\n✅ System audit completed. No critical issues found.")
    }
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new ComprehensiveSystemAudit()
  auditor.runFullAudit().catch(console.error)
}

export { ComprehensiveSystemAudit }
