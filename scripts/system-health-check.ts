import { createClient } from "@supabase/supabase-js"
import { existsSync } from "fs"
import { join } from "path"

interface HealthCheckResult {
  component: string
  status: "healthy" | "warning" | "error"
  message: string
  details?: any
}

class SystemHealthChecker {
  private results: HealthCheckResult[] = []

  async runAllChecks(): Promise<HealthCheckResult[]> {
    console.log("🔍 Starting system health check...\n")

    await this.checkEnvironmentVariables()
    await this.checkSupabaseConnection()
    await this.checkFileStructure()
    await this.checkTypeScriptCompilation()
    await this.checkAPIEndpoints()
    await this.checkDatabaseSchema()

    this.printResults()
    return this.results
  }

  private async checkEnvironmentVariables() {
    console.log("📋 Checking environment variables...")

    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    const missing = requiredEnvVars.filter((env) => !process.env[env])

    if (missing.length === 0) {
      this.addResult("Environment Variables", "healthy", "All required environment variables are set")
    } else {
      this.addResult("Environment Variables", "error", `Missing: ${missing.join(", ")}`)
    }
  }

  private async checkSupabaseConnection() {
    console.log("🗄️ Checking Supabase connection...")

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        this.addResult("Supabase Connection", "error", "Missing Supabase credentials")
        return
      }

      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        this.addResult("Supabase Connection", "warning", `Connection issue: ${error.message}`)
      } else {
        this.addResult("Supabase Connection", "healthy", "Successfully connected to Supabase")
      }
    } catch (error) {
      this.addResult("Supabase Connection", "error", `Failed to connect: ${error}`)
    }
  }

  private async checkFileStructure() {
    console.log("📁 Checking file structure...")

    const criticalFiles = [
      "app/layout.tsx",
      "app/page.tsx",
      "lib/supabase/client.ts",
      "lib/supabase/server.ts",
      "middleware.ts",
      "next.config.mjs",
      "tailwind.config.ts",
    ]

    const missingFiles = criticalFiles.filter((file) => !existsSync(join(process.cwd(), file)))

    if (missingFiles.length === 0) {
      this.addResult("File Structure", "healthy", "All critical files are present")
    } else {
      this.addResult("File Structure", "warning", `Missing files: ${missingFiles.join(", ")}`)
    }
  }

  private async checkTypeScriptCompilation() {
    console.log("🔧 Checking TypeScript compilation...")

    try {
      const { execSync } = require("child_process")
      execSync("npx tsc --noEmit --skipLibCheck", { stdio: "pipe" })
      this.addResult("TypeScript", "healthy", "No TypeScript compilation errors")
    } catch (error) {
      this.addResult("TypeScript", "error", "TypeScript compilation errors found")
    }
  }

  private async checkAPIEndpoints() {
    console.log("🌐 Checking API endpoints...")

    const apiRoutes = ["app/api/health/route.ts", "app/api/analytics/metrics/route.ts", "app/api/bills/route.ts"]

    const existingRoutes = apiRoutes.filter((route) => existsSync(join(process.cwd(), route)))

    if (existingRoutes.length > 0) {
      this.addResult("API Endpoints", "healthy", `Found ${existingRoutes.length} API routes`)
    } else {
      this.addResult("API Endpoints", "warning", "No API routes found")
    }
  }

  private async checkDatabaseSchema() {
    console.log("🗃️ Checking database schema...")

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        this.addResult("Database Schema", "error", "Cannot check schema without Supabase credentials")
        return
      }

      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      const tables = ["profiles", "products", "orders", "categories"]
      const tableChecks = await Promise.all(
        tables.map(async (table) => {
          try {
            const { error } = await supabase.from(table).select("*").limit(1)
            return { table, exists: !error }
          } catch {
            return { table, exists: false }
          }
        }),
      )

      const existingTables = tableChecks.filter((check) => check.exists)

      if (existingTables.length === tables.length) {
        this.addResult("Database Schema", "healthy", "All required tables exist")
      } else {
        const missing = tableChecks.filter((check) => !check.exists).map((check) => check.table)
        this.addResult("Database Schema", "warning", `Missing tables: ${missing.join(", ")}`)
      }
    } catch (error) {
      this.addResult("Database Schema", "error", `Schema check failed: ${error}`)
    }
  }

  private addResult(component: string, status: "healthy" | "warning" | "error", message: string, details?: any) {
    this.results.push({ component, status, message, details })
  }

  private printResults() {
    console.log("\n📊 Health Check Results:")
    console.log("========================\n")

    this.results.forEach((result) => {
      const icon = result.status === "healthy" ? "✅" : result.status === "warning" ? "⚠️" : "❌"
      console.log(`${icon} ${result.component}: ${result.message}`)
    })

    const healthy = this.results.filter((r) => r.status === "healthy").length
    const warnings = this.results.filter((r) => r.status === "warning").length
    const errors = this.results.filter((r) => r.status === "error").length

    console.log(`\n📈 Summary: ${healthy} healthy, ${warnings} warnings, ${errors} errors`)

    if (errors > 0) {
      console.log("\n🚨 Critical issues found! Please address errors before deployment.")
      process.exit(1)
    } else if (warnings > 0) {
      console.log("\n⚠️ Some warnings found. Consider addressing them for optimal performance.")
    } else {
      console.log("\n🎉 All systems healthy!")
    }
  }
}

// Run health check if called directly
if (require.main === module) {
  const checker = new SystemHealthChecker()
  checker.runAllChecks().catch(console.error)
}

export { SystemHealthChecker }
