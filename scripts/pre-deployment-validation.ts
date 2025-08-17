#!/usr/bin/env tsx

/**
 * Pre-Deployment Validation Pipeline
 * Validates system readiness before deployment
 */

import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

interface ValidationResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  critical: boolean
}

class DeploymentValidator {
  private results: ValidationResult[] = []

  private addResult(name: string, status: "pass" | "fail" | "warning", message: string, critical = false) {
    this.results.push({ name, status, message, critical })
    const icon = status === "pass" ? "✅" : status === "warning" ? "⚠️" : "❌"
    console.log(`${icon} ${name}: ${message}`)
  }

  async validatePackageJson() {
    try {
      const packagePath = join(process.cwd(), "package.json")
      if (!existsSync(packagePath)) {
        this.addResult("Package.json", "fail", "package.json not found", true)
        return
      }

      const packageJson = JSON.parse(readFileSync(packagePath, "utf8"))

      // Check for built-in modules in dependencies
      const builtInModules = ["fs", "path", "crypto", "util", "child_process", "node:child_process", "node:http"]
      const foundBuiltIns = builtInModules.filter((mod) => packageJson.dependencies?.[mod])

      if (foundBuiltIns.length > 0) {
        this.addResult("Dependencies", "fail", `Built-in modules found: ${foundBuiltIns.join(", ")}`, true)
      } else {
        this.addResult("Dependencies", "pass", "No built-in modules in dependencies")
      }

      // Check for required scripts
      const requiredScripts = ["build", "start"]
      const missingScripts = requiredScripts.filter((script) => !packageJson.scripts?.[script])

      if (missingScripts.length > 0) {
        this.addResult("Scripts", "fail", `Missing scripts: ${missingScripts.join(", ")}`, true)
      } else {
        this.addResult("Scripts", "pass", "All required scripts present")
      }
    } catch (error) {
      this.addResult("Package.json", "fail", `Error reading package.json: ${error}`, true)
    }
  }

  async validateNextConfig() {
    try {
      const configPath = join(process.cwd(), "next.config.mjs")
      if (!existsSync(configPath)) {
        this.addResult("Next Config", "warning", "next.config.mjs not found")
        return
      }

      // Basic syntax check
      execSync("node -c next.config.mjs", { stdio: "pipe" })
      this.addResult("Next Config", "pass", "Configuration file is valid")
    } catch (error) {
      this.addResult("Next Config", "fail", "Configuration file has syntax errors", true)
    }
  }

  async validateEnvironmentVariables() {
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      this.addResult("Environment", "warning", `Missing variables: ${missingVars.join(", ")}`)
    } else {
      this.addResult("Environment", "pass", "All critical environment variables present")
    }
  }

  async validateTypeScript() {
    try {
      execSync("npx tsc --noEmit", { stdio: "pipe" })
      this.addResult("TypeScript", "pass", "No type errors found")
    } catch (error) {
      this.addResult("TypeScript", "warning", "Type errors found - build may still succeed")
    }
  }

  async validateLinting() {
    try {
      execSync("npx eslint . --ext .ts,.tsx --max-warnings 0", { stdio: "pipe" })
      this.addResult("ESLint", "pass", "No linting errors found")
    } catch (error) {
      this.addResult("ESLint", "warning", "Linting issues found - build may still succeed")
    }
  }

  async validateBuildProcess() {
    try {
      console.log("🔨 Testing build process...")
      execSync("pnpm run build", {
        stdio: "pipe",
        env: { ...process.env, NODE_ENV: "production" },
      })
      this.addResult("Build Process", "pass", "Build completed successfully")
    } catch (error) {
      this.addResult("Build Process", "fail", "Build process failed", true)
    }
  }

  async runValidation() {
    console.log("🚀 Starting pre-deployment validation...\n")

    await this.validatePackageJson()
    await this.validateNextConfig()
    await this.validateEnvironmentVariables()
    await this.validateTypeScript()
    await this.validateLinting()
    await this.validateBuildProcess()

    // Summary
    const passed = this.results.filter((r) => r.status === "pass").length
    const warnings = this.results.filter((r) => r.status === "warning").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const criticalFailures = this.results.filter((r) => r.status === "fail" && r.critical).length

    console.log("\n📊 Validation Summary:")
    console.log(`✅ Passed: ${passed}`)
    console.log(`⚠️  Warnings: ${warnings}`)
    console.log(`❌ Failed: ${failed}`)

    if (criticalFailures > 0) {
      console.log(`\n💥 Critical failures detected: ${criticalFailures}`)
      console.log("🚫 Deployment should not proceed")
      process.exit(1)
    } else if (failed > 0) {
      console.log("\n⚠️  Non-critical failures detected")
      console.log("🟡 Deployment may proceed with caution")
    } else {
      console.log("\n🎉 All validations passed!")
      console.log("✅ Ready for deployment")
    }
  }
}

// Run validation
const validator = new DeploymentValidator()
validator.runValidation()
