#!/usr/bin/env tsx

/**
 * System Status Report Generator
 * สร้างรายงานสถานะระบบอย่างครอบคลุม
 */

import { execSync } from "child_process"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

interface SystemCheck {
  category: string
  name: string
  status: "healthy" | "warning" | "critical" | "unknown"
  message: string
  details?: any
  recommendations?: string[]
}

interface SystemReport {
  timestamp: string
  overallStatus: "healthy" | "warning" | "critical"
  summary: {
    totalChecks: number
    healthy: number
    warnings: number
    critical: number
  }
  checks: SystemCheck[]
  recommendations: string[]
  nextSteps: string[]
}

class SystemStatusReporter {
  private checks: SystemCheck[] = []
  private startTime = Date.now()

  private log(message: string, type: "info" | "success" | "error" | "warning" = "info") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      reset: "\x1b[0m",
    }

    console.log(`${colors[type]}[SYSTEM-REPORT] ${message}${colors.reset}`)
  }

  private async runCommand(command: string, silent = true): Promise<{ success: boolean; output: string }> {
    try {
      const output = execSync(command, {
        encoding: "utf8",
        stdio: silent ? "pipe" : "inherit",
        timeout: 30000,
      })
      return { success: true, output }
    } catch (error: any) {
      return { success: false, output: error.message }
    }
  }

  private addCheck(check: SystemCheck): void {
    this.checks.push(check)
    const icon = check.status === "healthy" ? "✓" : check.status === "warning" ? "⚠" : "✗"
    const color = check.status === "healthy" ? "success" : check.status === "warning" ? "warning" : "error"
    this.log(`${icon} ${check.category}: ${check.name} - ${check.message}`, color)
  }

  private async checkProjectStructure(): Promise<void> {
    this.log("Checking project structure...", "info")

    const requiredFiles = [
      { path: "package.json", name: "Package Configuration" },
      { path: "next.config.mjs", name: "Next.js Configuration" },
      { path: "tsconfig.json", name: "TypeScript Configuration" },
      { path: "tailwind.config.ts", name: "Tailwind Configuration" },
      { path: "middleware.ts", name: "Middleware" },
      { path: "app/layout.tsx", name: "Root Layout" },
      { path: "app/page.tsx", name: "Home Page" },
    ]

    for (const file of requiredFiles) {
      const exists = existsSync(file.path)
      this.addCheck({
        category: "Project Structure",
        name: file.name,
        status: exists ? "healthy" : "critical",
        message: exists ? "File exists" : "File missing",
        recommendations: exists ? [] : [`Create ${file.path}`],
      })
    }

    // Check important directories
    const requiredDirs = ["app", "components", "lib", "scripts"]
    for (const dir of requiredDirs) {
      const exists = existsSync(dir)
      this.addCheck({
        category: "Project Structure",
        name: `${dir}/ Directory`,
        status: exists ? "healthy" : "warning",
        message: exists ? "Directory exists" : "Directory missing",
        recommendations: exists ? [] : [`Create ${dir} directory`],
      })
    }
  }

  private async checkDependencies(): Promise<void> {
    this.log("Checking dependencies...", "info")

    // Check if package.json exists and is valid
    try {
      const packageJson = JSON.parse(readFileSync("package.json", "utf8"))

      this.addCheck({
        category: "Dependencies",
        name: "Package.json Validity",
        status: "healthy",
        message: "Valid JSON structure",
        details: {
          dependencies: Object.keys(packageJson.dependencies || {}).length,
          devDependencies: Object.keys(packageJson.devDependencies || {}).length,
        },
      })

      // Check for critical dependencies
      const criticalDeps = ["next", "react", "react-dom", "@supabase/supabase-js"]
      for (const dep of criticalDeps) {
        const exists = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
        this.addCheck({
          category: "Dependencies",
          name: `${dep} Package`,
          status: exists ? "healthy" : "critical",
          message: exists ? `Version: ${exists}` : "Missing critical dependency",
          recommendations: exists ? [] : [`Install ${dep}`],
        })
      }

      // Check for potential security issues
      const potentialIssues = []
      if (packageJson.dependencies?.["lodash"]) {
        potentialIssues.push("Consider using lodash-es for better tree shaking")
      }

      if (potentialIssues.length > 0) {
        this.addCheck({
          category: "Dependencies",
          name: "Security & Performance",
          status: "warning",
          message: `${potentialIssues.length} potential issues found`,
          details: potentialIssues,
          recommendations: potentialIssues,
        })
      }
    } catch (error) {
      this.addCheck({
        category: "Dependencies",
        name: "Package.json Validity",
        status: "critical",
        message: "Invalid or missing package.json",
        recommendations: ["Fix package.json syntax"],
      })
    }
  }

  private async checkBuildSystem(): Promise<void> {
    this.log("Checking build system...", "info")

    // Check TypeScript compilation
    const tsCheck = await this.runCommand("npx tsc --noEmit")
    this.addCheck({
      category: "Build System",
      name: "TypeScript Compilation",
      status: tsCheck.success ? "healthy" : "critical",
      message: tsCheck.success ? "No TypeScript errors" : "TypeScript errors found",
      details: tsCheck.success ? null : tsCheck.output,
      recommendations: tsCheck.success ? [] : ["Fix TypeScript errors", "Run: npx tsc --noEmit"],
    })

    // Check ESLint
    const lintCheck = await this.runCommand("npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0")
    this.addCheck({
      category: "Build System",
      name: "ESLint Check",
      status: lintCheck.success ? "healthy" : "warning",
      message: lintCheck.success ? "No linting errors" : "Linting issues found",
      details: lintCheck.success ? null : lintCheck.output,
      recommendations: lintCheck.success ? [] : ["Fix linting issues", "Run: npm run lint"],
    })

    // Check if build works
    const buildCheck = await this.runCommand("npm run build")
    this.addCheck({
      category: "Build System",
      name: "Production Build",
      status: buildCheck.success ? "healthy" : "critical",
      message: buildCheck.success ? "Build successful" : "Build failed",
      details: buildCheck.success ? null : buildCheck.output,
      recommendations: buildCheck.success ? [] : ["Fix build errors", "Check dependencies"],
    })
  }

  private async checkEnvironmentConfiguration(): Promise<void> {
    this.log("Checking environment configuration...", "info")

    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "DATABASE_URL",
    ]

    const optionalEnvVars = [
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
      "STRIPE_SECRET_KEY",
      "SENDGRID_API_KEY",
    ]

    let missingRequired = 0
    let missingOptional = 0

    for (const envVar of requiredEnvVars) {
      const exists = !!process.env[envVar]
      if (!exists) missingRequired++

      this.addCheck({
        category: "Environment",
        name: `${envVar}`,
        status: exists ? "healthy" : "critical",
        message: exists ? "Set" : "Missing",
        recommendations: exists ? [] : [`Set ${envVar} in environment variables`],
      })
    }

    for (const envVar of optionalEnvVars) {
      const exists = !!process.env[envVar]
      if (!exists) missingOptional++

      this.addCheck({
        category: "Environment",
        name: `${envVar} (Optional)`,
        status: exists ? "healthy" : "warning",
        message: exists ? "Set" : "Not set",
        recommendations: exists ? [] : [`Consider setting ${envVar} for full functionality`],
      })
    }

    // Overall environment status
    this.addCheck({
      category: "Environment",
      name: "Overall Configuration",
      status: missingRequired === 0 ? (missingOptional === 0 ? "healthy" : "warning") : "critical",
      message: `${requiredEnvVars.length - missingRequired}/${requiredEnvVars.length} required vars set, ${
        optionalEnvVars.length - missingOptional
      }/${optionalEnvVars.length} optional vars set`,
      recommendations:
        missingRequired > 0 ? ["Set all required environment variables"] : ["Consider setting optional variables"],
    })
  }

  private async checkDatabaseConnectivity(): Promise<void> {
    this.log("Checking database connectivity...", "info")

    try {
      // This would normally test actual database connection
      // For now, we'll check if the required environment variables are set
      const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (hasSupabaseUrl && hasSupabaseKey) {
        this.addCheck({
          category: "Database",
          name: "Supabase Configuration",
          status: "healthy",
          message: "Supabase credentials configured",
          recommendations: ["Test actual database connection"],
        })
      } else {
        this.addCheck({
          category: "Database",
          name: "Supabase Configuration",
          status: "critical",
          message: "Missing Supabase credentials",
          recommendations: ["Configure Supabase environment variables"],
        })
      }

      // Check for database schema files
      const schemaFiles = ["scripts/create-database-schema.sql", "scripts/setup-complete-database.sql"]
      let schemaFilesFound = 0

      for (const file of schemaFiles) {
        if (existsSync(file)) {
          schemaFilesFound++
        }
      }

      this.addCheck({
        category: "Database",
        name: "Schema Files",
        status: schemaFilesFound > 0 ? "healthy" : "warning",
        message: `${schemaFilesFound} schema files found`,
        recommendations: schemaFilesFound === 0 ? ["Create database schema files"] : [],
      })
    } catch (error) {
      this.addCheck({
        category: "Database",
        name: "Database Check",
        status: "critical",
        message: "Database check failed",
        details: error,
        recommendations: ["Check database configuration", "Verify network connectivity"],
      })
    }
  }

  private async checkSecurity(): Promise<void> {
    this.log("Checking security configuration...", "info")

    // Check for security-related files
    const securityFiles = [
      { path: "middleware.ts", name: "Middleware Protection" },
      { path: "lib/security-service.ts", name: "Security Service" },
      { path: "lib/brute-force-protection.ts", name: "Brute Force Protection" },
    ]

    for (const file of securityFiles) {
      const exists = existsSync(file.path)
      this.addCheck({
        category: "Security",
        name: file.name,
        status: exists ? "healthy" : "warning",
        message: exists ? "Implemented" : "Not implemented",
        recommendations: exists ? [] : [`Implement ${file.name}`],
      })
    }

    // Check for sensitive data exposure
    const sensitivePatterns = [
      { pattern: /password\s*=\s*["'][^"']+["']/gi, name: "Hardcoded Passwords" },
      { pattern: /api[_-]?key\s*=\s*["'][^"']+["']/gi, name: "Hardcoded API Keys" },
      { pattern: /secret\s*=\s*["'][^"']+["']/gi, name: "Hardcoded Secrets" },
    ]

    try {
      const packageJson = readFileSync("package.json", "utf8")
      let securityIssues = 0

      for (const { pattern, name } of sensitivePatterns) {
        if (pattern.test(packageJson)) {
          securityIssues++
        }
      }

      this.addCheck({
        category: "Security",
        name: "Sensitive Data Exposure",
        status: securityIssues === 0 ? "healthy" : "critical",
        message: securityIssues === 0 ? "No sensitive data found" : `${securityIssues} potential issues`,
        recommendations: securityIssues > 0 ? ["Remove hardcoded secrets", "Use environment variables"] : [],
      })
    } catch (error) {
      this.addCheck({
        category: "Security",
        name: "Sensitive Data Check",
        status: "unknown",
        message: "Could not perform security scan",
        recommendations: ["Manually review code for sensitive data"],
      })
    }
  }

  private async checkPerformance(): Promise<void> {
    this.log("Checking performance configuration...", "info")

    // Check Next.js configuration
    try {
      const nextConfigExists = existsSync("next.config.mjs")
      if (nextConfigExists) {
        const nextConfig = readFileSync("next.config.mjs", "utf8")

        const hasImageOptimization = nextConfig.includes("images")
        const hasCompression = nextConfig.includes("compress")
        const hasMinification = nextConfig.includes("minify")

        this.addCheck({
          category: "Performance",
          name: "Next.js Optimizations",
          status: hasImageOptimization ? "healthy" : "warning",
          message: `Image optimization: ${hasImageOptimization ? "enabled" : "disabled"}`,
          recommendations: hasImageOptimization ? [] : ["Enable Next.js image optimization"],
        })
      }

      // Check for bundle analyzer
      const packageJson = JSON.parse(readFileSync("package.json", "utf8"))
      const hasBundleAnalyzer = packageJson.devDependencies?.["@next/bundle-analyzer"]

      this.addCheck({
        category: "Performance",
        name: "Bundle Analysis",
        status: hasBundleAnalyzer ? "healthy" : "warning",
        message: hasBundleAnalyzer ? "Bundle analyzer available" : "Bundle analyzer not installed",
        recommendations: hasBundleAnalyzer ? [] : ["Install @next/bundle-analyzer for bundle optimization"],
      })
    } catch (error) {
      this.addCheck({
        category: "Performance",
        name: "Performance Check",
        status: "unknown",
        message: "Could not check performance configuration",
        recommendations: ["Manually review performance settings"],
      })
    }
  }

  private generateOverallStatus(): "healthy" | "warning" | "critical" {
    const criticalCount = this.checks.filter((c) => c.status === "critical").length
    const warningCount = this.checks.filter((c) => c.status === "warning").length

    if (criticalCount > 0) return "critical"
    if (warningCount > 0) return "warning"
    return "healthy"
  }

  private generateRecommendations(): string[] {
    const recommendations = new Set<string>()

    // Collect all recommendations
    this.checks.forEach((check) => {
      check.recommendations?.forEach((rec) => recommendations.add(rec))
    })

    // Add general recommendations based on status
    const overallStatus = this.generateOverallStatus()

    if (overallStatus === "critical") {
      recommendations.add("Address all critical issues before deployment")
      recommendations.add("Run comprehensive testing after fixes")
    }

    if (overallStatus === "warning") {
      recommendations.add("Consider addressing warning issues for optimal performance")
    }

    return Array.from(recommendations)
  }

  private generateNextSteps(): string[] {
    const steps = []
    const overallStatus = this.generateOverallStatus()

    if (overallStatus === "critical") {
      steps.push("1. Fix all critical issues immediately")
      steps.push("2. Re-run system status check")
      steps.push("3. Perform full system testing")
      steps.push("4. Deploy to staging environment first")
    } else if (overallStatus === "warning") {
      steps.push("1. Review and address warning issues")
      steps.push("2. Run performance tests")
      steps.push("3. Consider deployment to production")
    } else {
      steps.push("1. System is ready for deployment")
      steps.push("2. Monitor system after deployment")
      steps.push("3. Schedule regular health checks")
    }

    return steps
  }

  private generateReport(): SystemReport {
    const overallStatus = this.generateOverallStatus()
    const summary = {
      totalChecks: this.checks.length,
      healthy: this.checks.filter((c) => c.status === "healthy").length,
      warnings: this.checks.filter((c) => c.status === "warning").length,
      critical: this.checks.filter((c) => c.status === "critical").length,
    }

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      summary,
      checks: this.checks,
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps(),
    }
  }

  private saveReport(report: SystemReport): void {
    const reportPath = join(process.cwd(), "system-status-report.json")
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    this.log(`Report saved to: ${reportPath}`, "info")

    // Also create a markdown version
    const markdownReport = this.generateMarkdownReport(report)
    const markdownPath = join(process.cwd(), "SYSTEM_STATUS_REPORT.md")
    writeFileSync(markdownPath, markdownReport)
    this.log(`Markdown report saved to: ${markdownPath}`, "info")
  }

  private generateMarkdownReport(report: SystemReport): string {
    const statusEmoji = {
      healthy: "✅",
      warning: "⚠️",
      critical: "❌",
      unknown: "❓",
    }

    let markdown = `# System Status Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}
**Overall Status:** ${statusEmoji[report.overallStatus]} ${report.overallStatus.toUpperCase()}

## Summary

- **Total Checks:** ${report.summary.totalChecks}
- **Healthy:** ${report.summary.healthy}
- **Warnings:** ${report.summary.warnings}
- **Critical:** ${report.summary.critical}

## Detailed Results

`

    // Group checks by category
    const categories = [...new Set(report.checks.map((c) => c.category))]

    for (const category of categories) {
      markdown += `### ${category}\n\n`

      const categoryChecks = report.checks.filter((c) => c.category === category)
      for (const check of categoryChecks) {
        markdown += `- ${statusEmoji[check.status]} **${check.name}:** ${check.message}\n`
        if (check.recommendations && check.recommendations.length > 0) {
          markdown += `  - *Recommendations:* ${check.recommendations.join(", ")}\n`
        }
      }
      markdown += "\n"
    }

    if (report.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`
      report.recommendations.forEach((rec, index) => {
        markdown += `${index + 1}. ${rec}\n`
      })
      markdown += "\n"
    }

    if (report.nextSteps.length > 0) {
      markdown += `## Next Steps\n\n`
      report.nextSteps.forEach((step) => {
        markdown += `${step}\n`
      })
    }

    return markdown
  }

  private displayReport(report: SystemReport): void {
    const totalTime = Date.now() - this.startTime

    this.log("=".repeat(60), "info")
    this.log("SYSTEM STATUS REPORT", "info")
    this.log("=".repeat(60), "info")

    const statusColor =
      report.overallStatus === "healthy" ? "success" : report.overallStatus === "warning" ? "warning" : "error"
    this.log(`Overall Status: ${report.overallStatus.toUpperCase()}`, statusColor)
    this.log(`Total Checks: ${report.summary.totalChecks}`, "info")
    this.log(`Healthy: ${report.summary.healthy}`, "success")
    this.log(`Warnings: ${report.summary.warnings}`, "warning")
    this.log(`Critical: ${report.summary.critical}`, "error")
    this.log(`Total Time: ${totalTime}ms`, "info")

    if (report.recommendations.length > 0) {
      this.log("\nTop Recommendations:", "info")
      report.recommendations.slice(0, 5).forEach((rec, index) => {
        this.log(`${index + 1}. ${rec}`, "warning")
      })
    }

    this.log("\nNext Steps:", "info")
    report.nextSteps.forEach((step) => {
      this.log(step, "info")
    })

    this.log("=".repeat(60), "info")

    if (report.overallStatus === "healthy") {
      this.log("🎉 SYSTEM STATUS: HEALTHY! Ready for deployment.", "success")
    } else if (report.overallStatus === "warning") {
      this.log("⚠️ SYSTEM STATUS: WARNINGS DETECTED. Review before deployment.", "warning")
    } else {
      this.log("❌ SYSTEM STATUS: CRITICAL ISSUES! Fix before deployment.", "error")
    }
  }

  async generateSystemReport(): Promise<SystemReport> {
    this.log("Starting comprehensive system status check...", "info")
    this.log("=".repeat(60), "info")

    // Run all checks
    await this.checkProjectStructure()
    await this.checkDependencies()
    await this.checkBuildSystem()
    await this.checkEnvironmentConfiguration()
    await this.checkDatabaseConnectivity()
    await this.checkSecurity()
    await this.checkPerformance()

    // Generate and save report
    const report = this.generateReport()
    this.saveReport(report)
    this.displayReport(report)

    return report
  }
}

// Run the system status check
const reporter = new SystemStatusReporter()
reporter
  .generateSystemReport()
  .then((report) => {
    process.exit(report.overallStatus === "critical" ? 1 : 0)
  })
  .catch((error) => {
    console.error("System status check failed with error:", error)
    process.exit(1)
  })
