#!/usr/bin/env tsx

/**
 * Master Test Runner
 * รันการทดสอบทั้งหมดตามลำดับ
 */

import { execSync } from "child_process"

interface TestResult {
  name: string
  success: boolean
  duration: number
  output: string
}

class MasterTestRunner {
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

    console.log(`${colors[type]}[MASTER-TEST] ${message}${colors.reset}`)
  }

  private async runTest(name: string, command: string): Promise<TestResult> {
    const testStart = Date.now()
    this.log(`Running: ${name}...`, "info")

    try {
      const output = execSync(command, {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 300000, // 5 minutes
      })

      const duration = Date.now() - testStart
      this.log(`✓ ${name} completed (${duration}ms)`, "success")

      return {
        name,
        success: true,
        duration,
        output,
      }
    } catch (error: any) {
      const duration = Date.now() - testStart
      this.log(`✗ ${name} failed (${duration}ms)`, "error")

      return {
        name,
        success: false,
        duration,
        output: error.message,
      }
    }
  }

  async runAllTests(): Promise<void> {
    this.log("Starting comprehensive system testing...", "info")
    this.log("=".repeat(80), "info")

    const tests = [
      { name: "Build System Test", command: "tsx scripts/comprehensive-build-test.ts" },
      { name: "TypeScript & Linting Test", command: "tsx scripts/typescript-lint-test.ts" },
      { name: "Database Connectivity Test", command: "tsx scripts/database-connectivity-test.ts" },
      { name: "Authentication System Test", command: "tsx scripts/authentication-system-test.ts" },
      { name: "System Status Report", command: "tsx scripts/system-status-report.ts" },
    ]

    // Run tests sequentially
    for (const test of tests) {
      const result = await this.runTest(test.name, test.command)
      this.results.push(result)

      // Stop on critical failures (optional)
      if (!result.success && test.name.includes("Build")) {
        this.log("Critical build failure detected. Stopping tests.", "error")
        break
      }
    }

    this.generateFinalReport()
  }

  private generateFinalReport(): void {
    const totalTime = Date.now() - this.startTime
    const passed = this.results.filter((r) => r.success).length
    const failed = this.results.filter((r) => r.success === false).length

    this.log("=".repeat(80), "info")
    this.log("COMPREHENSIVE TEST REPORT", "info")
    this.log("=".repeat(80), "info")

    this.results.forEach((result) => {
      const icon = result.success ? "✓" : "✗"
      const color = result.success ? "success" : "error"
      this.log(`${icon} ${result.name}: ${result.success ? "PASSED" : "FAILED"} (${result.duration}ms)`, color)

      if (!result.success && result.output) {
        this.log(`   Error: ${result.output.substring(0, 200)}...`, "error")
      }
    })

    this.log("=".repeat(80), "info")
    this.log(`Total Tests: ${this.results.length}`, "info")
    this.log(`Passed: ${passed}`, passed > 0 ? "success" : "info")
    this.log(`Failed: ${failed}`, failed > 0 ? "error" : "info")
    this.log(`Total Time: ${Math.round(totalTime / 1000)}s`, "info")

    if (failed === 0) {
      this.log("🎉 ALL TESTS PASSED! System is ready for deployment.", "success")
    } else {
      this.log(`❌ ${failed} TEST(S) FAILED! Please review and fix issues.`, "error")
    }

    this.log("=".repeat(80), "info")
    this.log("Next Steps:", "info")

    if (failed === 0) {
      this.log("1. Review system status report", "info")
      this.log("2. Deploy to staging environment", "info")
      this.log("3. Perform user acceptance testing", "info")
      this.log("4. Deploy to production", "info")
    } else {
      this.log("1. Fix failing tests", "info")
      this.log("2. Re-run test suite", "info")
      this.log("3. Review system status report", "info")
      this.log("4. Proceed with deployment only after all tests pass", "info")
    }
  }
}

// Run all tests
const runner = new MasterTestRunner()
runner
  .runAllTests()
  .then(() => {
    const failed = runner["results"].filter((r) => !r.success).length
    process.exit(failed > 0 ? 1 : 0)
  })
  .catch((error) => {
    console.error("Master test runner failed:", error)
    process.exit(1)
  })
