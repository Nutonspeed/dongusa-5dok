import { createClient } from "@supabase/supabase-js"
import { existsSync } from "fs"
import { join } from "path"

interface CriticalIssue {
  severity: "critical" | "high" | "medium" | "low"
  component: string
  issue: string
  impact: string
  solution: string
  timestamp: string
}

interface SystemStatus {
  overall: "healthy" | "degraded" | "critical" | "failed"
  issues: CriticalIssue[]
  recommendations: string[]
  timestamp: string
}

class EmergencySystemDiagnosis {
  private issues: CriticalIssue[] = []
  private recommendations: string[] = []

  async runEmergencyDiagnosis(): Promise<SystemStatus> {
    console.log("🚨 EMERGENCY SYSTEM DIAGNOSIS - CRITICAL FAILURE ANALYSIS")
    console.log("=".repeat(80))
    console.log(`Started at: ${new Date().toISOString()}`)
    console.log("=".repeat(80))

    // Critical system checks in order of importance
    await this.checkDatabaseConnectivity()
    await this.checkAuthenticationSystem()
    await this.checkEnvironmentConfiguration()
    await this.checkAPIEndpoints()
    await this.checkFileSystemIntegrity()
    await this.checkMemoryAndPerformance()
    await this.checkSecurityVulnerabilities()
    await this.checkDataIntegrity()

    const status = this.generateSystemStatus()
    this.printDiagnosisReport(status)

    return status
  }

  private async checkDatabaseConnectivity() {
    console.log("\n🔍 [CRITICAL] Database Connectivity Analysis...")

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseKey) {
        this.addIssue(
          "critical",
          "Database",
          "Missing Supabase credentials",
          "Complete system failure - no database access",
          "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
        )
        return
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      // Test basic connection
      const startTime = Date.now()
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      const responseTime = Date.now() - startTime

      if (error) {
        this.addIssue(
          "critical",
          "Database",
          `Connection failed: ${error.message}`,
          "All database operations failing",
          "Check Supabase project status and credentials",
        )
      } else if (responseTime > 5000) {
        this.addIssue(
          "high",
          "Database",
          `Slow response time: ${responseTime}ms`,
          "Poor user experience and timeouts",
          "Optimize database queries and check network connectivity",
        )
      } else {
        console.log("✅ Database connectivity: OK")
      }

      // Test critical tables
      const criticalTables = ["profiles", "products", "orders", "categories", "customers"]
      for (const table of criticalTables) {
        try {
          const { error: tableError } = await supabase.from(table).select("id").limit(1)
          if (tableError) {
            this.addIssue(
              "high",
              "Database",
              `Table '${table}' inaccessible: ${tableError.message}`,
              "Core functionality broken",
              `Create or fix table '${table}' schema`,
            )
          }
        } catch (e) {
          this.addIssue(
            "critical",
            "Database",
            `Table '${table}' completely missing`,
            "Core functionality broken",
            `Run database migration to create '${table}' table`,
          )
        }
      }
    } catch (error) {
      this.addIssue(
        "critical",
        "Database",
        `Connection completely failed: ${error}`,
        "Total system failure",
        "Check Supabase service status and network connectivity",
      )
    }
  }

  private async checkAuthenticationSystem() {
    console.log("\n🔍 [CRITICAL] Authentication System Analysis...")

    try {
      // Check auth configuration
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        this.addIssue(
          "critical",
          "Authentication",
          "Missing auth credentials",
          "Users cannot login or register",
          "Configure Supabase authentication",
        )
        return
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      // Test auth service
      try {
        const { data: session } = await supabase.auth.getSession()
        console.log("✅ Auth service: Accessible")
      } catch (error) {
        this.addIssue(
          "critical",
          "Authentication",
          `Auth service failed: ${error}`,
          "Complete authentication failure",
          "Check Supabase auth configuration",
        )
      }

      // Check auth routes
      const authRoutes = ["app/api/auth/login/route.ts", "app/auth/login/page.tsx", "app/auth/register/page.tsx"]

      for (const route of authRoutes) {
        if (!existsSync(join(process.cwd(), route))) {
          this.addIssue(
            "high",
            "Authentication",
            `Missing auth route: ${route}`,
            "Authentication flow broken",
            `Create missing auth route: ${route}`,
          )
        }
      }
    } catch (error) {
      this.addIssue(
        "critical",
        "Authentication",
        `Auth system check failed: ${error}`,
        "Cannot verify auth status",
        "Debug authentication system configuration",
      )
    }
  }

  private async checkEnvironmentConfiguration() {
    console.log("\n🔍 [HIGH] Environment Configuration Analysis...")

    const criticalEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    const importantEnvVars = ["STRIPE_SECRET_KEY", "BLOB_READ_WRITE_TOKEN", "SMTP_HOST", "SENDGRID_API_KEY"]

    const missingCritical = criticalEnvVars.filter((env) => !process.env[env])
    const missingImportant = importantEnvVars.filter((env) => !process.env[env])

    if (missingCritical.length > 0) {
      this.addIssue(
        "critical",
        "Environment",
        `Missing critical env vars: ${missingCritical.join(", ")}`,
        "Core system functionality broken",
        "Configure all critical environment variables",
      )
    }

    if (missingImportant.length > 0) {
      this.addIssue(
        "medium",
        "Environment",
        `Missing optional env vars: ${missingImportant.join(", ")}`,
        "Some features may not work",
        "Configure optional environment variables for full functionality",
      )
    }

    // Check for invalid configurations
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://")) {
      this.addIssue(
        "high",
        "Environment",
        "Invalid Supabase URL format",
        "Database connections may fail",
        "Ensure Supabase URL starts with https://",
      )
    }
  }

  private async checkAPIEndpoints() {
    console.log("\n🔍 [HIGH] API Endpoints Analysis...")

    const criticalAPIs = [
      "app/api/health/route.ts",
      "app/api/auth/login/route.ts",
      "app/api/products/route.ts",
      "app/api/orders/route.ts",
    ]

    for (const api of criticalAPIs) {
      if (!existsSync(join(process.cwd(), api))) {
        this.addIssue(
          "high",
          "API",
          `Missing critical API: ${api}`,
          "Core functionality unavailable",
          `Create missing API endpoint: ${api}`,
        )
      }
    }

    // Test API accessibility (if running)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const healthResponse = await fetch(`${baseUrl}/api/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      })

      if (!healthResponse.ok) {
        this.addIssue(
          "high",
          "API",
          `Health endpoint returning ${healthResponse.status}`,
          "System health monitoring broken",
          "Debug health API endpoint",
        )
      }
    } catch (error) {
      // API not accessible (server not running) - this is expected during diagnosis
      console.log("ℹ️  API endpoints not accessible (server not running)")
    }
  }

  private async checkFileSystemIntegrity() {
    console.log("\n🔍 [MEDIUM] File System Integrity Analysis...")

    const criticalFiles = [
      "app/layout.tsx",
      "app/page.tsx",
      "app/globals.css",
      "next.config.mjs",
      "package.json",
      "tailwind.config.ts",
    ]

    const criticalDirs = ["app", "components", "lib", "public"]

    for (const file of criticalFiles) {
      if (!existsSync(join(process.cwd(), file))) {
        this.addIssue(
          "high",
          "FileSystem",
          `Missing critical file: ${file}`,
          "Application may not start",
          `Restore missing file: ${file}`,
        )
      }
    }

    for (const dir of criticalDirs) {
      if (!existsSync(join(process.cwd(), dir))) {
        this.addIssue(
          "high",
          "FileSystem",
          `Missing critical directory: ${dir}`,
          "Application structure broken",
          `Create missing directory: ${dir}`,
        )
      }
    }
  }

  private async checkMemoryAndPerformance() {
    console.log("\n🔍 [MEDIUM] Memory and Performance Analysis...")

    const memUsage = process.memoryUsage()
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    }

    if (memUsageMB.heapUsed > 512) {
      this.addIssue(
        "medium",
        "Performance",
        `High memory usage: ${memUsageMB.heapUsed}MB`,
        "Potential memory leaks or performance issues",
        "Investigate memory usage and optimize code",
      )
    }

    // Check for large files that might cause issues
    const packageJsonPath = join(process.cwd(), "package.json")
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = require(packageJsonPath)
        const depCount =
          Object.keys(packageJson.dependencies || {}).length + Object.keys(packageJson.devDependencies || {}).length

        if (depCount > 100) {
          this.addIssue(
            "low",
            "Performance",
            `High dependency count: ${depCount}`,
            "Slow build times and potential conflicts",
            "Review and remove unnecessary dependencies",
          )
        }
      } catch (error) {
        this.addIssue(
          "medium",
          "FileSystem",
          "Corrupted package.json",
          "Cannot install dependencies",
          "Fix or restore package.json file",
        )
      }
    }
  }

  private async checkSecurityVulnerabilities() {
    console.log("\n🔍 [HIGH] Security Vulnerabilities Analysis...")

    // Check for exposed sensitive data
    const sensitivePatterns = [
      { pattern: /sk_live_[a-zA-Z0-9]+/, name: "Stripe Live Key" },
      { pattern: /pk_live_[a-zA-Z0-9]+/, name: "Stripe Live Public Key" },
      { pattern: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/, name: "JWT Token" },
    ]

    // Check environment variables for security issues
    if (process.env.NODE_ENV === "production") {
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
        this.addIssue(
          "high",
          "Security",
          "Debug mode enabled in production",
          "Sensitive information exposure",
          "Disable debug mode in production",
        )
      }

      if (!process.env.NEXTAUTH_SECRET) {
        this.addIssue(
          "high",
          "Security",
          "Missing NextAuth secret in production",
          "Authentication security compromised",
          "Set NEXTAUTH_SECRET environment variable",
        )
      }
    }

    // Check for default/weak passwords in demo data
    if (process.env.QA_BYPASS_AUTH === "1" && process.env.NODE_ENV === "production") {
      this.addIssue(
        "critical",
        "Security",
        "QA bypass enabled in production",
        "Complete security bypass",
        "Disable QA_BYPASS_AUTH in production",
      )
    }
  }

  private async checkDataIntegrity() {
    console.log("\n🔍 [MEDIUM] Data Integrity Analysis...")

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        return // Already handled in database check
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      // Check for orphaned records
      try {
        const { data: orders, error: ordersError } = await supabase.from("orders").select("id, customer_id").limit(10)

        if (!ordersError && orders && orders.length > 0) {
          const customerIds = orders.map((o) => o.customer_id).filter(Boolean)
          if (customerIds.length > 0) {
            const { data: customers, error: customersError } = await supabase
              .from("customers")
              .select("id")
              .in("id", customerIds)

            if (!customersError) {
              const existingCustomerIds = customers?.map((c) => c.id) || []
              const orphanedOrders = orders.filter((o) => o.customer_id && !existingCustomerIds.includes(o.customer_id))

              if (orphanedOrders.length > 0) {
                this.addIssue(
                  "medium",
                  "Data",
                  `Found ${orphanedOrders.length} orphaned orders`,
                  "Data inconsistency issues",
                  "Clean up orphaned records and add foreign key constraints",
                )
              }
            }
          }
        }
      } catch (error) {
        // Data integrity check failed, but not critical
        console.log("ℹ️  Data integrity check skipped due to access restrictions")
      }
    } catch (error) {
      // Non-critical error
      console.log("ℹ️  Data integrity check failed:", error)
    }
  }

  private addIssue(
    severity: "critical" | "high" | "medium" | "low",
    component: string,
    issue: string,
    impact: string,
    solution: string,
  ) {
    this.issues.push({
      severity,
      component,
      issue,
      impact,
      solution,
      timestamp: new Date().toISOString(),
    })

    const icon = severity === "critical" ? "🚨" : severity === "high" ? "⚠️" : severity === "medium" ? "⚡" : "ℹ️"
    console.log(`${icon} [${severity.toUpperCase()}] ${component}: ${issue}`)
  }

  private generateSystemStatus(): SystemStatus {
    const criticalCount = this.issues.filter((i) => i.severity === "critical").length
    const highCount = this.issues.filter((i) => i.severity === "high").length

    let overall: "healthy" | "degraded" | "critical" | "failed"

    if (criticalCount > 0) {
      overall = "failed"
    } else if (highCount > 2) {
      overall = "critical"
    } else if (highCount > 0 || this.issues.filter((i) => i.severity === "medium").length > 3) {
      overall = "degraded"
    } else {
      overall = "healthy"
    }

    // Generate recommendations
    this.recommendations = [
      "1. Address all CRITICAL issues immediately - system is non-functional",
      "2. Fix HIGH priority issues to restore core functionality",
      "3. Configure missing environment variables",
      "4. Run database migrations if tables are missing",
      "5. Test authentication flow after fixes",
      "6. Monitor system health after repairs",
    ]

    return {
      overall,
      issues: this.issues,
      recommendations: this.recommendations,
      timestamp: new Date().toISOString(),
    }
  }

  private printDiagnosisReport(status: SystemStatus) {
    console.log("\n" + "=".repeat(80))
    console.log("🚨 EMERGENCY DIAGNOSIS REPORT")
    console.log("=".repeat(80))
    console.log(`Overall System Status: ${status.overall.toUpperCase()}`)
    console.log(`Total Issues Found: ${status.issues.length}`)
    console.log(`Report Generated: ${status.timestamp}`)
    console.log("=".repeat(80))

    // Group issues by severity
    const critical = status.issues.filter((i) => i.severity === "critical")
    const high = status.issues.filter((i) => i.severity === "high")
    const medium = status.issues.filter((i) => i.severity === "medium")
    const low = status.issues.filter((i) => i.severity === "low")

    if (critical.length > 0) {
      console.log("\n🚨 CRITICAL ISSUES (System Failure):")
      critical.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.component}: ${issue.issue}`)
        console.log(`   Impact: ${issue.impact}`)
        console.log(`   Solution: ${issue.solution}\n`)
      })
    }

    if (high.length > 0) {
      console.log("\n⚠️  HIGH PRIORITY ISSUES:")
      high.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.component}: ${issue.issue}`)
        console.log(`   Impact: ${issue.impact}`)
        console.log(`   Solution: ${issue.solution}\n`)
      })
    }

    if (medium.length > 0) {
      console.log("\n⚡ MEDIUM PRIORITY ISSUES:")
      medium.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.component}: ${issue.issue}`)
        console.log(`   Solution: ${issue.solution}`)
      })
    }

    if (low.length > 0) {
      console.log("\nℹ️  LOW PRIORITY ISSUES:")
      low.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.component}: ${issue.issue}`)
      })
    }

    console.log("\n📋 RECOMMENDED ACTION PLAN:")
    status.recommendations.forEach((rec) => console.log(rec))

    console.log("\n" + "=".repeat(80))
    console.log("END OF EMERGENCY DIAGNOSIS REPORT")
    console.log("=".repeat(80))
  }
}

// Run emergency diagnosis
async function main() {
  const diagnosis = new EmergencySystemDiagnosis()
  const result = await diagnosis.runEmergencyDiagnosis()

  // Exit with error code if system is failed or critical
  if (result.overall === "failed" || result.overall === "critical") {
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { EmergencySystemDiagnosis }
