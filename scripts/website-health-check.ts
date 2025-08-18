#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js"
import fs from "fs"

interface HealthCheckResult {
  component: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: any
}

class WebsiteHealthChecker {
  private results: HealthCheckResult[] = []

  private addResult(component: string, status: "pass" | "fail" | "warning", message: string, details?: any) {
    this.results.push({ component, status, message, details })
  }

  private log(message: string, type: "info" | "success" | "warning" | "error" = "info") {
    const colors = {
      info: "\x1b[36m", // Cyan
      success: "\x1b[32m", // Green
      warning: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      reset: "\x1b[0m",
    }

    const prefix = {
      info: "ℹ",
      success: "✓",
      warning: "⚠",
      error: "✗",
    }

    console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`)
  }

  async checkFileStructure(): Promise<void> {
    this.log("Checking file structure...", "info")

    const requiredFiles = [
      "app/page.tsx",
      "app/layout.tsx",
      "app/globals.css",
      "next.config.js",
      "package.json",
      "tsconfig.json",
    ]

    const requiredDirectories = ["app/components", "app/contexts", "components/ui", "lib"]

    let allFilesExist = true

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.addResult("File Structure", "pass", `${file} exists`)
      } else {
        this.addResult("File Structure", "fail", `${file} is missing`)
        allFilesExist = false
      }
    }

    for (const dir of requiredDirectories) {
      if (fs.existsSync(dir)) {
        this.addResult("File Structure", "pass", `${dir}/ directory exists`)
      } else {
        this.addResult("File Structure", "fail", `${dir}/ directory is missing`)
        allFilesExist = false
      }
    }

    if (allFilesExist) {
      this.log("File structure check passed", "success")
    } else {
      this.log("File structure check failed", "error")
    }
  }

  async checkSupabaseConnection(): Promise<void> {
    this.log("Checking Supabase connection...", "info")

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        this.addResult("Supabase", "fail", "Supabase environment variables not found")
        this.log("Supabase environment variables missing", "error")
        return
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      // Test connection by trying to fetch from a table
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        this.addResult("Supabase", "warning", `Supabase connection test failed: ${error.message}`)
        this.log("Supabase connection test failed", "warning")
      } else {
        this.addResult("Supabase", "pass", "Supabase connection successful")
        this.log("Supabase connection test passed", "success")
      }
    } catch (error) {
      this.addResult("Supabase", "fail", `Supabase connection error: ${error}`)
      this.log("Supabase connection error", "error")
    }
  }

  async checkEnvironmentVariables(): Promise<void> {
    this.log("Checking environment variables...", "info")

    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    const optionalEnvVars = [
      "SUPABASE_SERVICE_ROLE_KEY",
      "XAI_API_KEY",
      "BLOB_READ_WRITE_TOKEN",
      "KV_REST_API_URL",
      "KV_REST_API_TOKEN",
    ]

    let allRequiredPresent = true

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.addResult("Environment", "pass", `${envVar} is set`)
      } else {
        this.addResult("Environment", "fail", `${envVar} is missing`)
        allRequiredPresent = false
      }
    }

    for (const envVar of optionalEnvVars) {
      if (process.env[envVar]) {
        this.addResult("Environment", "pass", `${envVar} is set (optional)`)
      } else {
        this.addResult("Environment", "warning", `${envVar} is not set (optional)`)
      }
    }

    if (allRequiredPresent) {
      this.log("Environment variables check passed", "success")
    } else {
      this.log("Some required environment variables are missing", "error")
    }
  }

  async checkImports(): Promise<void> {
    this.log("Checking critical imports...", "info")

    const criticalFiles = [
      "app/page.tsx",
      "app/layout.tsx",
      "app/components/Header.tsx",
      "app/components/Hero.tsx",
      "app/components/FeaturedProducts.tsx",
    ]

    for (const file of criticalFiles) {
      try {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, "utf-8")

          // Check for common import issues
          const imports = content.match(/^import.*from.*$/gm) || []
          let hasIssues = false

          for (const importLine of imports) {
            // Check for relative imports that might be broken
            if (importLine.includes("../") && importLine.includes("@/")) {
              this.addResult("Imports", "warning", `Mixed import styles in ${file}: ${importLine}`)
              hasIssues = true
            }
          }

          if (!hasIssues) {
            this.addResult("Imports", "pass", `${file} imports look good`)
          }
        }
      } catch (error) {
        this.addResult("Imports", "fail", `Error checking imports in ${file}: ${error}`)
      }
    }

    this.log("Import check completed", "success")
  }

  async checkPackageJson(): Promise<void> {
    this.log("Checking package.json...", "info")

    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"))

      // Check for critical dependencies
      const criticalDeps = ["next", "react", "react-dom", "@supabase/supabase-js", "lucide-react", "tailwindcss"]

      let allCriticalPresent = true

      for (const dep of criticalDeps) {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
          this.addResult("Dependencies", "pass", `${dep} is installed`)
        } else {
          this.addResult("Dependencies", "fail", `${dep} is missing`)
          allCriticalPresent = false
        }
      }

      // Check for version conflicts
      const reactVersion = packageJson.dependencies?.react
      const nextVersion = packageJson.dependencies?.next

      if (reactVersion && nextVersion) {
        if (reactVersion.includes("19") && !nextVersion.includes("15")) {
          this.addResult("Dependencies", "warning", "React 19 with Next.js < 15 may cause compatibility issues")
        } else {
          this.addResult("Dependencies", "pass", "React and Next.js versions are compatible")
        }
      }

      if (allCriticalPresent) {
        this.log("Package.json check passed", "success")
      } else {
        this.log("Some critical dependencies are missing", "error")
      }
    } catch (error) {
      this.addResult("Dependencies", "fail", `Error reading package.json: ${error}`)
      this.log("Package.json check failed", "error")
    }
  }

  async runAllChecks(): Promise<void> {
    this.log("🚀 Starting website health check...", "info")
    console.log("")

    await this.checkFileStructure()
    await this.checkPackageJson()
    await this.checkEnvironmentVariables()
    await this.checkImports()
    await this.checkSupabaseConnection()

    this.generateReport()
  }

  private generateReport(): void {
    console.log("")
    this.log("📊 Health Check Report", "info")
    console.log("=".repeat(50))

    const summary = {
      pass: this.results.filter((r) => r.status === "pass").length,
      warning: this.results.filter((r) => r.status === "warning").length,
      fail: this.results.filter((r) => r.status === "fail").length,
    }

    console.log(`✓ Passed: ${summary.pass}`)
    console.log(`⚠ Warnings: ${summary.warning}`)
    console.log(`✗ Failed: ${summary.fail}`)
    console.log("")

    // Group results by component
    const groupedResults = this.results.reduce(
      (acc, result) => {
        if (!acc[result.component]) {
          acc[result.component] = []
        }
        acc[result.component].push(result)
        return acc
      },
      {} as Record<string, HealthCheckResult[]>,
    )

    for (const [component, results] of Object.entries(groupedResults)) {
      console.log(`\n📋 ${component}:`)
      for (const result of results) {
        const icon = result.status === "pass" ? "✓" : result.status === "warning" ? "⚠" : "✗"
        const color = result.status === "pass" ? "\x1b[32m" : result.status === "warning" ? "\x1b[33m" : "\x1b[31m"
        console.log(`  ${color}${icon} ${result.message}\x1b[0m`)
      }
    }

    console.log("")

    if (summary.fail > 0) {
      this.log("❌ Health check completed with failures. Please address the issues above.", "error")
      process.exit(1)
    } else if (summary.warning > 0) {
      this.log("⚠️  Health check completed with warnings. Consider addressing them.", "warning")
    } else {
      this.log("✅ All health checks passed! Your website is ready.", "success")
    }
  }
}

// Run the health check
async function main() {
  const checker = new WebsiteHealthChecker()
  await checker.runAllChecks()
}

if (require.main === module) {
  main().catch(console.error)
}

export { WebsiteHealthChecker }
