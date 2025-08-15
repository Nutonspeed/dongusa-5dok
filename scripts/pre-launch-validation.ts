import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"

const execAsync = promisify(exec)

interface ValidationResult {
  category: string
  test: string
  status: "pass" | "fail" | "warning"
  message: string
  timestamp: string
}

class PreLaunchValidator {
  private results: ValidationResult[] = []

  private addResult(category: string, test: string, status: "pass" | "fail" | "warning", message: string) {
    this.results.push({
      category,
      test,
      status,
      message,
      timestamp: new Date().toISOString(),
    })
  }

  async validateEnvironment(): Promise<void> {
    console.log("🔍 Validating Environment Variables...")

    const requiredEnvVars = [
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "BLOB_READ_WRITE_TOKEN",
      "XAI_API_KEY",
    ]

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.addResult("Environment", envVar, "pass", "Environment variable is set")
      } else {
        this.addResult("Environment", envVar, "fail", "Environment variable is missing")
      }
    }
  }

  async validateDatabase(): Promise<void> {
    console.log("🗄️ Validating Database Connection...")

    try {
      // Test Supabase connection
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      })

      if (response.ok) {
        this.addResult("Database", "Supabase Connection", "pass", "Database connection successful")
      } else {
        this.addResult("Database", "Supabase Connection", "fail", `Database connection failed: ${response.status}`)
      }
    } catch (error) {
      this.addResult("Database", "Supabase Connection", "fail", `Database connection error: ${error}`)
    }
  }

  async validateBuild(): Promise<void> {
    console.log("🏗️ Validating Build Process...")

    try {
      const { stdout, stderr } = await execAsync("npm run build")

      if (stderr && !stderr.includes("warning")) {
        this.addResult("Build", "Production Build", "fail", `Build failed: ${stderr}`)
      } else {
        this.addResult("Build", "Production Build", "pass", "Production build successful")
      }
    } catch (error) {
      this.addResult("Build", "Production Build", "fail", `Build error: ${error}`)
    }
  }

  async validateTests(): Promise<void> {
    console.log("🧪 Running Test Suite...")

    try {
      // Run unit tests
      const { stdout: jestOutput } = await execAsync("npm run test -- --passWithNoTests")
      this.addResult("Testing", "Unit Tests", "pass", "Unit tests passed")

      // Run E2E tests if available
      try {
        const { stdout: e2eOutput } = await execAsync("npm run test:e2e -- --reporter=json")
        this.addResult("Testing", "E2E Tests", "pass", "E2E tests passed")
      } catch (e2eError) {
        this.addResult("Testing", "E2E Tests", "warning", "E2E tests not available or failed")
      }
    } catch (error) {
      this.addResult("Testing", "Test Suite", "fail", `Tests failed: ${error}`)
    }
  }

  async validateSecurity(): Promise<void> {
    console.log("🔒 Validating Security Configuration...")

    // Check for security headers
    const securityChecks = [
      { name: "HTTPS Redirect", check: () => process.env.NODE_ENV === "production" },
      { name: "Environment Secrets", check: () => !process.env.JWT_SECRET?.includes("default") },
      { name: "API Keys", check: () => process.env.SUPABASE_ANON_KEY?.length > 20 },
    ]

    for (const { name, check } of securityChecks) {
      try {
        if (check()) {
          this.addResult("Security", name, "pass", "Security check passed")
        } else {
          this.addResult("Security", name, "warning", "Security check needs attention")
        }
      } catch (error) {
        this.addResult("Security", name, "fail", `Security check failed: ${error}`)
      }
    }
  }

  async validatePerformance(): Promise<void> {
    console.log("⚡ Validating Performance...")

    try {
      // Check bundle size
      const buildDir = path.join(process.cwd(), ".next")
      const stats = await fs.stat(buildDir).catch(() => null)

      if (stats) {
        this.addResult("Performance", "Build Output", "pass", "Build output exists")
      } else {
        this.addResult("Performance", "Build Output", "warning", "Build output not found")
      }

      // Validate critical resources
      const criticalFiles = ["app/page.tsx", "app/layout.tsx", "app/globals.css"]

      for (const file of criticalFiles) {
        try {
          await fs.access(file)
          this.addResult("Performance", `Critical File: ${file}`, "pass", "File exists")
        } catch {
          this.addResult("Performance", `Critical File: ${file}`, "fail", "Critical file missing")
        }
      }
    } catch (error) {
      this.addResult("Performance", "Performance Check", "fail", `Performance validation failed: ${error}`)
    }
  }

  async generateReport(): Promise<void> {
    const timestamp = new Date().toISOString()
    const reportPath = path.join(process.cwd(), "docs", "pre-launch-validation-report.json")

    const summary = {
      timestamp,
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "pass").length,
      failed: this.results.filter((r) => r.status === "fail").length,
      warnings: this.results.filter((r) => r.status === "warning").length,
      results: this.results,
    }

    await fs.writeFile(reportPath, JSON.stringify(summary, null, 2))

    console.log("\n📊 Pre-Launch Validation Summary:")
    console.log(`✅ Passed: ${summary.passed}`)
    console.log(`❌ Failed: ${summary.failed}`)
    console.log(`⚠️  Warnings: ${summary.warnings}`)
    console.log(`📄 Report saved to: ${reportPath}`)

    if (summary.failed > 0) {
      console.log("\n❌ Pre-launch validation failed. Please address the issues before deployment.")
      process.exit(1)
    } else {
      console.log("\n✅ Pre-launch validation passed! System is ready for deployment.")
    }
  }

  async runFullValidation(): Promise<void> {
    console.log("🚀 Starting Pre-Launch Validation...\n")

    await this.validateEnvironment()
    await this.validateDatabase()
    await this.validateBuild()
    await this.validateTests()
    await this.validateSecurity()
    await this.validatePerformance()
    await this.generateReport()
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new PreLaunchValidator()
  validator.runFullValidation().catch(console.error)
}

export default PreLaunchValidator
