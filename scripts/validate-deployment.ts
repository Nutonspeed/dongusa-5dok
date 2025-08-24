#!/usr/bin/env node

/**
 * Deployment Validation Script
 * ตรวจสอบความพร้อมของโปรเจคก่อน deployment
 */

import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

interface ValidationResult {
  step: string
  success: boolean
  message: string
  details?: string
}

class DeploymentValidator {
  private results: ValidationResult[] = []

  private addResult(step: string, success: boolean, message: string, details?: string) {
    this.results.push({ step, success, message, details })
    const status = success ? "✅" : "❌"
    console.log(`${status} ${step}: ${message}`)
    if (details) {
      console.log(`   ${details}`)
    }
  }

  private runCommand(command: string): { success: boolean; output: string } {
    try {
      const output = execSync(command, { encoding: "utf8", stdio: "pipe" })
      return { success: true, output }
    } catch (error: any) {
      return { success: false, output: error.message }
    }
  }

  validateNodeVersion() {
    const nvmrcPath = join(process.cwd(), ".nvmrc")
    const packageJsonPath = join(process.cwd(), "package.json")

    if (!existsSync(nvmrcPath)) {
      this.addResult("Node Version", false, ".nvmrc file not found")
      return
    }

    const nvmrcVersion = readFileSync(nvmrcPath, "utf8").trim()
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
    const engineVersion = packageJson.engines?.node

    const currentVersion = process.version

    this.addResult(
      "Node Version",
      currentVersion.includes(nvmrcVersion.replace("v", "")),
      `Current: ${currentVersion}, Required: ${nvmrcVersion}`,
      `Engine requirement: ${engineVersion}`,
    )
  }

  validateDependencies() {
    const { success, output } = this.runCommand("npm ls --depth=0")

    if (success) {
      this.addResult("Dependencies", true, "All dependencies resolved correctly")
    } else {
      const hasConflicts = output.includes("ERESOLVE") || output.includes("peer dep missing")
      this.addResult(
        "Dependencies",
        false,
        hasConflicts ? "Dependency conflicts detected" : "Some dependencies missing",
        output.split("\n").slice(0, 5).join("\n"),
      )
    }
  }

  validateTypeScript() {
    const { success, output } = this.runCommand("npx tsc --noEmit")

    this.addResult(
      "TypeScript",
      success,
      success ? "Type checking passed" : "Type errors found",
      success ? undefined : output.split("\n").slice(0, 10).join("\n"),
    )
  }

  validateESLint() {
    const { success, output } = this.runCommand("npx eslint . --ext .ts,.tsx --max-warnings 0")

    this.addResult(
      "ESLint",
      success,
      success ? "Linting passed" : "Linting errors found",
      success ? undefined : output.split("\n").slice(0, 10).join("\n"),
    )
  }

  validateBuild() {
    console.log("🔄 Running build test (this may take a while)...")
    const { success, output } = this.runCommand("npm run build")

    this.addResult(
      "Build",
      success,
      success ? "Build completed successfully" : "Build failed",
      success ? undefined : output.split("\n").slice(-10).join("\n"),
    )
  }

  validateEnvironment() {
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    this.addResult(
      "Environment",
      missingVars.length === 0,
      missingVars.length === 0
        ? "All required environment variables present"
        : `Missing variables: ${missingVars.join(", ")}`,
      missingVars.length > 0 ? "Check your .env.local file" : undefined,
    )
  }

  async runValidation() {
    console.log("🚀 Starting deployment validation...\n")

    this.validateNodeVersion()
    this.validateEnvironment()
    this.validateDependencies()
    this.validateTypeScript()
    this.validateESLint()
    this.validateBuild()

    console.log("\n📊 Validation Summary:")
    console.log("=".repeat(50))

    const passed = this.results.filter((r) => r.success).length
    const total = this.results.length

    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${total - passed}/${total}`)

    if (passed === total) {
      console.log("\n🎉 All validations passed! Ready for deployment.")
      process.exit(0)
    } else {
      console.log("\n⚠️  Some validations failed. Please fix the issues before deploying.")
      console.log("\nFailed checks:")
      this.results.filter((r) => !r.success).forEach((r) => console.log(`  - ${r.step}: ${r.message}`))

      process.exit(1)
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new DeploymentValidator()
  validator.runValidation().catch(console.error)
}

export default DeploymentValidator
