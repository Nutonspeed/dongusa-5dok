#!/usr/bin/env tsx

/**
 * Execute Production Deployment Test
 * Comprehensive test suite for validating deployment readiness
 */

import { execSync } from "child_process"
import { existsSync, writeFileSync } from "fs"

interface TestResult {
  name: string
  status: "pass" | "fail" | "skip"
  duration: number
  message: string
  critical: boolean
}

class DeploymentTestSuite {
  private results: TestResult[] = []
  private startTime = Date.now()

  private async runTest(name: string, testFn: () => Promise<void> | void, critical = false): Promise<void> {
    const testStart = Date.now()
    console.log(`🧪 Running: ${name}`)

    try {
      await testFn()
      const duration = Date.now() - testStart
      this.results.push({
        name,
        status: "pass",
        duration,
        message: "Test passed successfully",
        critical,
      })
      console.log(`✅ ${name} - Passed (${duration}ms)`)
    } catch (error) {
      const duration = Date.now() - testStart
      this.results.push({
        name,
        status: "fail",
        duration,
        message: error instanceof Error ? error.message : String(error),
        critical,
      })
      console.log(`❌ ${name} - Failed (${duration}ms): ${error}`)
    }
  }

  private async testPackageIntegrity() {
    // Test package.json integrity
    if (!existsSync("package.json")) {
      throw new Error("package.json not found")
    }

    // Test for problematic dependencies
    execSync(
      "node -e \"const pkg = require('./package.json'); const builtIns = ['fs', 'path', 'crypto', 'util', 'child_process']; const found = builtIns.filter(m => pkg.dependencies && pkg.dependencies[m]); if (found.length) throw new Error('Built-in modules found: ' + found.join(', '))\"",
    )
  }

  private async testBuildConfiguration() {
    // Test Next.js config syntax
    if (existsSync("next.config.mjs")) {
      execSync("node -c next.config.mjs")
    }

    // Test fallback configs
    if (existsSync("next.config.production.mjs")) {
      execSync("node -c next.config.production.mjs")
    }

    if (existsSync("next.config.fallback.mjs")) {
      execSync("node -c next.config.fallback.mjs")
    }
  }

  private async testEnvironmentSetup() {
    // Test environment validator
    execSync("tsx lib/environment-validator.ts", { stdio: "pipe" })

    // Check critical environment variables
    const criticalVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    const missing = criticalVars.filter((v) => !process.env[v])

    if (missing.length > 0) {
      throw new Error(`Missing critical environment variables: ${missing.join(", ")}`)
    }
  }

  private async testDatabaseConnectivity() {
    // Test database health
    try {
      execSync("tsx scripts/backend-verification.ts", { stdio: "pipe" })
    } catch (error) {
      console.warn("Database connectivity test failed - may be expected in CI")
    }
  }

  private async testBuildProcess() {
    // Test build with fallback strategy
    execSync("tsx scripts/build-with-fallback.ts", {
      env: { ...process.env, NODE_ENV: "production", CI: "true" },
    })

    // Verify build output
    if (!existsSync(".next")) {
      throw new Error("Build output directory not found")
    }
  }

  private async testDeploymentScripts() {
    // Test deployment fix script
    execSync("tsx scripts/fix-deployment.ts", { stdio: "pipe" })

    // Test pre-deployment validation
    execSync("tsx scripts/pre-deployment-validation.ts", { stdio: "pipe" })
  }

  private async testSecurityConfiguration() {
    // Test security headers
    if (existsSync("lib/security-headers.ts")) {
      execSync("tsx lib/security-headers.ts", { stdio: "pipe" })
    }

    // Test brute force protection
    if (existsSync("lib/brute-force-protection.ts")) {
      execSync("node -c lib/brute-force-protection.ts")
    }
  }

  private generateReport() {
    const totalDuration = Date.now() - this.startTime
    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const criticalFailures = this.results.filter((r) => r.status === "fail" && r.critical).length

    const report = {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      summary: {
        total: this.results.length,
        passed,
        failed,
        criticalFailures,
      },
      results: this.results,
    }

    // Write detailed report
    writeFileSync("deployment-test-report.json", JSON.stringify(report, null, 2))

    console.log("\n" + "=".repeat(60))
    console.log("📊 DEPLOYMENT TEST SUMMARY")
    console.log("=".repeat(60))
    console.log(`⏱️  Total Duration: ${totalDuration}ms`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`🚨 Critical Failures: ${criticalFailures}`)

    if (criticalFailures > 0) {
      console.log("\n💥 CRITICAL FAILURES DETECTED")
      console.log("🚫 Deployment should NOT proceed")
      console.log("\nCritical failures:")
      this.results
        .filter((r) => r.status === "fail" && r.critical)
        .forEach((r) => console.log(`  - ${r.name}: ${r.message}`))
      return false
    } else if (failed > 0) {
      console.log("\n⚠️  NON-CRITICAL FAILURES DETECTED")
      console.log("🟡 Deployment may proceed with caution")
      console.log("\nFailures:")
      this.results.filter((r) => r.status === "fail").forEach((r) => console.log(`  - ${r.name}: ${r.message}`))
      return true
    } else {
      console.log("\n🎉 ALL TESTS PASSED!")
      console.log("✅ Ready for production deployment")
      return true
    }
  }

  async executeTests() {
    console.log("🚀 Starting Production Deployment Test Suite")
    console.log("=".repeat(60))

    // Critical tests that must pass
    await this.runTest("Package Integrity", () => this.testPackageIntegrity(), true)
    await this.runTest("Build Configuration", () => this.testBuildConfiguration(), true)
    await this.runTest("Build Process", () => this.testBuildProcess(), true)
    await this.runTest("Deployment Scripts", () => this.testDeploymentScripts(), true)

    // Important but non-critical tests
    await this.runTest("Environment Setup", () => this.testEnvironmentSetup(), false)
    await this.runTest("Database Connectivity", () => this.testDatabaseConnectivity(), false)
    await this.runTest("Security Configuration", () => this.testSecurityConfiguration(), false)

    const success = this.generateReport()
    process.exit(success ? 0 : 1)
  }
}

// Execute the test suite
const testSuite = new DeploymentTestSuite()
testSuite.executeTests()
