#!/usr/bin/env tsx

/**
 * Comprehensive Build Test Script
 * ทดสอบการ build และ deployment readiness อย่างครอบคลุม
 */

import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

interface TestResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  duration?: number
}

class BuildTester {
  private results: TestResult[] = []
  private startTime = Date.now()

  private log(message: string, type: "info" | "success" | "error" | "warning" = "info") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      reset: "\x1b[0m",
    }

    console.log(`${colors[type]}[BUILD-TEST] ${message}${colors.reset}`)
  }

  private async runCommand(command: string, description: string): Promise<TestResult> {
    const testStart = Date.now()
    this.log(`Running: ${description}...`)

    try {
      const output = execSync(command, {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 300000, // 5 minutes timeout
      })

      const duration = Date.now() - testStart
      this.log(`✓ ${description} completed (${duration}ms)`, "success")

      return {
        name: description,
        status: "pass",
        message: `Completed successfully in ${duration}ms`,
        duration,
      }
    } catch (error: any) {
      const duration = Date.now() - testStart
      this.log(`✗ ${description} failed: ${error.message}`, "error")

      return {
        name: description,
        status: "fail",
        message: error.message,
        duration,
      }
    }
  }

  private checkFileExists(filePath: string, description: string): TestResult {
    const fullPath = join(process.cwd(), filePath)
    const exists = existsSync(fullPath)

    if (exists) {
      this.log(`✓ ${description} exists`, "success")
      return {
        name: description,
        status: "pass",
        message: `File exists at ${filePath}`,
      }
    } else {
      this.log(`✗ ${description} missing`, "error")
      return {
        name: description,
        status: "fail",
        message: `File missing at ${filePath}`,
      }
    }
  }

  private checkPackageJson(): TestResult {
    try {
      const packagePath = join(process.cwd(), "package.json")
      const packageJson = JSON.parse(readFileSync(packagePath, "utf8"))

      const requiredScripts = ["build", "dev", "start", "lint"]
      const missingScripts = requiredScripts.filter((script) => !packageJson.scripts?.[script])

      if (missingScripts.length === 0) {
        this.log("✓ All required scripts present in package.json", "success")
        return {
          name: "Package.json Scripts Check",
          status: "pass",
          message: "All required scripts are present",
        }
      } else {
        this.log(`✗ Missing scripts: ${missingScripts.join(", ")}`, "error")
        return {
          name: "Package.json Scripts Check",
          status: "fail",
          message: `Missing scripts: ${missingScripts.join(", ")}`,
        }
      }
    } catch (error: any) {
      return {
        name: "Package.json Scripts Check",
        status: "fail",
        message: `Error reading package.json: ${error.message}`,
      }
    }
  }

  private checkEnvironmentVariables(): TestResult {
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "DATABASE_URL"]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length === 0) {
      this.log("✓ All critical environment variables present", "success")
      return {
        name: "Environment Variables Check",
        status: "pass",
        message: "All critical environment variables are set",
      }
    } else {
      this.log(`⚠ Missing environment variables: ${missingVars.join(", ")}`, "warning")
      return {
        name: "Environment Variables Check",
        status: "warning",
        message: `Missing variables: ${missingVars.join(", ")} (may work with defaults)`,
      }
    }
  }

  async runAllTests(): Promise<void> {
    this.log("Starting comprehensive build test...", "info")
    this.log("=".repeat(60), "info")

    // 1. File existence checks
    this.results.push(this.checkFileExists("package.json", "Package.json"))
    this.results.push(this.checkFileExists("next.config.mjs", "Next.js Config"))
    this.results.push(this.checkFileExists("tsconfig.json", "TypeScript Config"))
    this.results.push(this.checkFileExists("tailwind.config.ts", "Tailwind Config"))

    // 2. Package.json validation
    this.results.push(this.checkPackageJson())

    // 3. Environment variables check
    this.results.push(this.checkEnvironmentVariables())

    // 4. Dependencies installation
    this.results.push(await this.runCommand("npm install", "Dependencies Installation"))

    // 5. TypeScript compilation check
    this.results.push(await this.runCommand("npx tsc --noEmit", "TypeScript Compilation"))

    // 6. Linting check
    this.results.push(await this.runCommand("npm run lint", "ESLint Check"))

    // 7. Build test
    this.results.push(await this.runCommand("npm run build", "Production Build"))

    // 8. Generate report
    this.generateReport()
  }

  private generateReport(): void {
    const totalTime = Date.now() - this.startTime
    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const warnings = this.results.filter((r) => r.status === "warning").length

    this.log("=".repeat(60), "info")
    this.log("BUILD TEST REPORT", "info")
    this.log("=".repeat(60), "info")

    this.results.forEach((result) => {
      const icon = result.status === "pass" ? "✓" : result.status === "fail" ? "✗" : "⚠"
      const color = result.status === "pass" ? "success" : result.status === "fail" ? "error" : "warning"
      this.log(`${icon} ${result.name}: ${result.message}`, color)
    })

    this.log("=".repeat(60), "info")
    this.log(`Total Tests: ${this.results.length}`, "info")
    this.log(`Passed: ${passed}`, passed > 0 ? "success" : "info")
    this.log(`Failed: ${failed}`, failed > 0 ? "error" : "info")
    this.log(`Warnings: ${warnings}`, warnings > 0 ? "warning" : "info")
    this.log(`Total Time: ${totalTime}ms`, "info")

    if (failed === 0) {
      this.log("🎉 BUILD TEST PASSED! System is ready for deployment.", "success")
      process.exit(0)
    } else {
      this.log("❌ BUILD TEST FAILED! Please fix the issues above.", "error")
      process.exit(1)
    }
  }
}

// Run the test
const tester = new BuildTester()
tester.runAllTests().catch((error) => {
  console.error("Build test failed with error:", error)
  process.exit(1)
})
