#!/usr/bin/env node

/**
 * Build Test Script
 * Tests the project build process and identifies issues
 */

import { execSync } from "child_process"
import { existsSync } from "fs"
import path from "path"

interface BuildResult {
  success: boolean
  error?: string
  warnings?: string[]
  duration?: number
}

class BuildTester {
  private projectRoot: string

  constructor() {
    this.projectRoot = process.cwd()
  }

  private log(message: string, type: "info" | "success" | "error" | "warning" = "info") {
    const colors = {
      info: "\x1b[36m", // Cyan
      success: "\x1b[32m", // Green
      error: "\x1b[31m", // Red
      warning: "\x1b[33m", // Yellow
      reset: "\x1b[0m",
    }

    const prefix = {
      info: "[INFO]",
      success: "[SUCCESS]",
      error: "[ERROR]",
      warning: "[WARNING]",
    }

    console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`)
  }

  private async runCommand(
    command: string,
    description: string,
  ): Promise<{ success: boolean; output: string; error?: string }> {
    this.log(`Running: ${description}...`)

    try {
      const startTime = Date.now()
      const output = execSync(command, {
        cwd: this.projectRoot,
        encoding: "utf8",
        stdio: "pipe",
      })
      const duration = Date.now() - startTime

      this.log(`✓ ${description} completed in ${duration}ms`, "success")
      return { success: true, output }
    } catch (error: any) {
      this.log(`✗ ${description} failed: ${error.message}`, "error")
      return {
        success: false,
        output: error.stdout || "",
        error: error.stderr || error.message,
      }
    }
  }

  private checkPrerequisites(): boolean {
    this.log("Checking prerequisites...")

    const requiredFiles = ["package.json", "next.config.mjs", "tsconfig.json"]

    for (const file of requiredFiles) {
      if (!existsSync(path.join(this.projectRoot, file))) {
        this.log(`Missing required file: ${file}`, "error")
        return false
      }
    }

    this.log("All required files present", "success")
    return true
  }

  private async testDependencyInstallation(): Promise<BuildResult> {
    this.log("Testing dependency installation...")

    const result = await this.runCommand("pnpm install --frozen-lockfile", "Dependency installation")

    if (!result.success) {
      return {
        success: false,
        error: `Dependency installation failed: ${result.error}`,
      }
    }

    return { success: true }
  }

  private async testTypeChecking(): Promise<BuildResult> {
    this.log("Testing TypeScript compilation...")

    const result = await this.runCommand("pnpm run type-check", "TypeScript type checking")

    if (!result.success) {
      return {
        success: false,
        error: `TypeScript errors found: ${result.error}`,
      }
    }

    return { success: true }
  }

  private async testLinting(): Promise<BuildResult> {
    this.log("Testing ESLint...")

    const result = await this.runCommand("pnpm run lint", "ESLint checking")

    if (!result.success) {
      // Linting warnings shouldn't fail the build, but we should report them
      return {
        success: true,
        warnings: [`Linting issues found: ${result.error}`],
      }
    }

    return { success: true }
  }

  private async testBuild(): Promise<BuildResult> {
    this.log("Testing Next.js build...")

    const startTime = Date.now()
    const result = await this.runCommand("pnpm run build", "Next.js build")
    const duration = Date.now() - startTime

    if (!result.success) {
      return {
        success: false,
        error: `Build failed: ${result.error}`,
        duration,
      }
    }

    // Check if build output exists
    const buildDir = path.join(this.projectRoot, ".next")
    if (!existsSync(buildDir)) {
      return {
        success: false,
        error: "Build completed but .next directory not found",
      }
    }

    return { success: true, duration }
  }

  public async runFullTest(): Promise<void> {
    this.log("Starting comprehensive build test...", "info")
    this.log("=".repeat(50), "info")

    // Check prerequisites
    if (!this.checkPrerequisites()) {
      this.log("Prerequisites check failed. Aborting.", "error")
      process.exit(1)
    }

    const tests = [
      { name: "Dependency Installation", test: () => this.testDependencyInstallation() },
      { name: "TypeScript Checking", test: () => this.testTypeChecking() },
      { name: "ESLint Checking", test: () => this.testLinting() },
      { name: "Next.js Build", test: () => this.testBuild() },
    ]

    let allPassed = true
    const results: Array<{ name: string; result: BuildResult }> = []

    for (const { name, test } of tests) {
      this.log(`\n--- ${name} ---`, "info")
      const result = await test()
      results.push({ name, result })

      if (!result.success) {
        allPassed = false
        this.log(`${name} failed: ${result.error}`, "error")
      } else {
        this.log(`${name} passed`, "success")
        if (result.warnings?.length) {
          result.warnings.forEach((warning) => this.log(warning, "warning"))
        }
      }
    }

    // Summary
    this.log("\n" + "=".repeat(50), "info")
    this.log("BUILD TEST SUMMARY", "info")
    this.log("=".repeat(50), "info")

    results.forEach(({ name, result }) => {
      const status = result.success ? "✓ PASS" : "✗ FAIL"
      const color = result.success ? "success" : "error"
      this.log(`${status} ${name}`, color)

      if (result.duration) {
        this.log(`    Duration: ${result.duration}ms`, "info")
      }
    })

    if (allPassed) {
      this.log("\n🎉 All tests passed! Project is ready for deployment.", "success")
      process.exit(0)
    } else {
      this.log("\n❌ Some tests failed. Please fix the issues above.", "error")
      process.exit(1)
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  const tester = new BuildTester()
  tester.runFullTest().catch((error) => {
    console.error("Build test failed with unexpected error:", error)
    process.exit(1)
  })
}

export default BuildTester
