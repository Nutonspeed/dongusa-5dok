import { readFileSync, existsSync } from "fs"

interface ProductionReadinessCheck {
  category: string
  checks: Array<{
    name: string
    status: "pass" | "fail" | "warning"
    message: string
    critical: boolean
  }>
}

class FinalProductionReadinessChecker {
  private results: ProductionReadinessCheck[] = []

  async runAllChecks(): Promise<void> {
    console.log("🔍 Running final production readiness checks...")

    await this.checkEnvironmentVariables()
    await this.checkDatabaseConnectivity()
    await this.checkSecurityConfiguration()
    await this.checkPerformanceOptimization()
    await this.checkMonitoringSetup()
    await this.checkDeploymentConfiguration()
    await this.checkBackupAndRecovery()

    this.generateReport()
  }

  private async checkEnvironmentVariables(): Promise<void> {
    const checks: ProductionReadinessCheck = {
      category: "Environment Variables",
      checks: [],
    }

    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "NEXT_PUBLIC_SITE_URL",
      "BLOB_READ_WRITE_TOKEN",
    ]

    for (const envVar of requiredVars) {
      if (process.env[envVar]) {
        checks.checks.push({
          name: envVar,
          status: "pass",
          message: "Environment variable is set",
          critical: true,
        })
      } else {
        checks.checks.push({
          name: envVar,
          status: "fail",
          message: "Missing required environment variable",
          critical: true,
        })
      }
    }

    this.results.push(checks)
  }

  private async checkDatabaseConnectivity(): Promise<void> {
    const checks: ProductionReadinessCheck = {
      category: "Database Connectivity",
      checks: [],
    }

    try {
      // Test Supabase connection
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      })

      if (response.ok) {
        checks.checks.push({
          name: "Supabase Connection",
          status: "pass",
          message: "Successfully connected to Supabase",
          critical: true,
        })
      } else {
        checks.checks.push({
          name: "Supabase Connection",
          status: "fail",
          message: `Failed to connect to Supabase: ${response.status}`,
          critical: true,
        })
      }
    } catch (error) {
      checks.checks.push({
        name: "Supabase Connection",
        status: "fail",
        message: `Database connection error: ${error}`,
        critical: true,
      })
    }

    this.results.push(checks)
  }

  private async checkSecurityConfiguration(): Promise<void> {
    const checks: ProductionReadinessCheck = {
      category: "Security Configuration",
      checks: [],
    }

    // Check if security headers are configured
    const vercelConfigExists = existsSync("vercel.json")
    if (vercelConfigExists) {
      const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf-8"))
      if (vercelConfig.headers) {
        checks.checks.push({
          name: "Security Headers",
          status: "pass",
          message: "Security headers configured in vercel.json",
          critical: true,
        })
      } else {
        checks.checks.push({
          name: "Security Headers",
          status: "warning",
          message: "Security headers not found in vercel.json",
          critical: false,
        })
      }
    }

    // Check Next.js security configuration
    const nextConfigExists = existsSync("next.config.mjs")
    if (nextConfigExists) {
      checks.checks.push({
        name: "Next.js Security Config",
        status: "pass",
        message: "Next.js configuration file exists",
        critical: false,
      })
    }

    this.results.push(checks)
  }

  private async checkPerformanceOptimization(): Promise<void> {
    const checks: ProductionReadinessCheck = {
      category: "Performance Optimization",
      checks: [],
    }

    // Check if performance optimization files exist
    const performanceFiles = [
      "lib/performance/database-optimizer.ts",
      "lib/database-cache.ts",
      "lib/performance/cache-service.ts",
    ]

    for (const file of performanceFiles) {
      if (existsSync(file)) {
        checks.checks.push({
          name: `Performance File: ${file}`,
          status: "pass",
          message: "Performance optimization file exists",
          critical: false,
        })
      } else {
        checks.checks.push({
          name: `Performance File: ${file}`,
          status: "warning",
          message: "Performance optimization file missing",
          critical: false,
        })
      }
    }

    this.results.push(checks)
  }

  private async checkMonitoringSetup(): Promise<void> {
    const checks: ProductionReadinessCheck = {
      category: "Monitoring Setup",
      checks: [],
    }

    // Check monitoring files
    const monitoringFiles = ["lib/monitoring-service.ts", "app/api/health/route.ts", "lib/system-health-monitor.ts"]

    for (const file of monitoringFiles) {
      if (existsSync(file)) {
        checks.checks.push({
          name: `Monitoring File: ${file}`,
          status: "pass",
          message: "Monitoring file exists",
          critical: true,
        })
      } else {
        checks.checks.push({
          name: `Monitoring File: ${file}`,
          status: "fail",
          message: "Critical monitoring file missing",
          critical: true,
        })
      }
    }

    this.results.push(checks)
  }

  private async checkDeploymentConfiguration(): Promise<void> {
    const checks: ProductionReadinessCheck = {
      category: "Deployment Configuration",
      checks: [],
    }

    // Check CI/CD configuration
    if (existsSync(".github/workflows/ci.yml")) {
      checks.checks.push({
        name: "CI/CD Pipeline",
        status: "pass",
        message: "GitHub Actions workflow configured",
        critical: false,
      })
    } else {
      checks.checks.push({
        name: "CI/CD Pipeline",
        status: "warning",
        message: "No CI/CD pipeline found",
        critical: false,
      })
    }

    // Check deployment scripts
    if (existsSync("scripts/production-deploy.ts")) {
      checks.checks.push({
        name: "Deployment Script",
        status: "pass",
        message: "Production deployment script exists",
        critical: false,
      })
    }

    this.results.push(checks)
  }

  private async checkBackupAndRecovery(): Promise<void> {
    const checks: ProductionReadinessCheck = {
      category: "Backup & Recovery",
      checks: [],
    }

    // Check if backup procedures are documented
    if (existsSync("PRODUCTION_READINESS_GUIDE.md")) {
      checks.checks.push({
        name: "Production Guide",
        status: "pass",
        message: "Production readiness guide exists",
        critical: true,
      })
    }

    // Check rollback procedures
    if (existsSync("docs/PRODUCTION_DEPLOYMENT_GUIDE.md")) {
      checks.checks.push({
        name: "Deployment Guide",
        status: "pass",
        message: "Deployment guide with rollback procedures exists",
        critical: true,
      })
    }

    this.results.push(checks)
  }

  private generateReport(): void {
    console.log("\n" + "=".repeat(80))
    console.log("🚀 FINAL PRODUCTION READINESS REPORT")
    console.log("=".repeat(80))

    let totalChecks = 0
    let passedChecks = 0
    let failedCritical = 0

    for (const category of this.results) {
      console.log(`\n📋 ${category.category}`)
      console.log("-".repeat(40))

      for (const check of category.checks) {
        totalChecks++
        const icon = check.status === "pass" ? "✅" : check.status === "fail" ? "❌" : "⚠️"
        console.log(`${icon} ${check.name}: ${check.message}`)

        if (check.status === "pass") passedChecks++
        if (check.status === "fail" && check.critical) failedCritical++
      }
    }

    console.log("\n" + "=".repeat(80))
    console.log("📊 SUMMARY")
    console.log("=".repeat(80))
    console.log(`Total Checks: ${totalChecks}`)
    console.log(`Passed: ${passedChecks}`)
    console.log(`Failed: ${totalChecks - passedChecks}`)
    console.log(`Critical Failures: ${failedCritical}`)

    const successRate = Math.round((passedChecks / totalChecks) * 100)
    console.log(`Success Rate: ${successRate}%`)

    if (failedCritical === 0 && successRate >= 90) {
      console.log("\n🎉 PRODUCTION READY! ✅")
      console.log("System is ready for production deployment.")
    } else if (failedCritical === 0) {
      console.log("\n⚠️  PRODUCTION READY WITH WARNINGS")
      console.log("System can be deployed but some optimizations are recommended.")
    } else {
      console.log("\n❌ NOT PRODUCTION READY")
      console.log("Critical issues must be resolved before deployment.")
    }

    console.log("=".repeat(80))
  }
}

// CLI usage
if (require.main === module) {
  const checker = new FinalProductionReadinessChecker()
  checker.runAllChecks().catch(console.error)
}

export { FinalProductionReadinessChecker }
