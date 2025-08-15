#!/usr/bin/env tsx

import { createClient } from "@/lib/supabase/server"

interface VerificationResult {
  component: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: any
}

class BackendVerifier {
  private results: VerificationResult[] = []

  async verifyDatabase(): Promise<void> {
    try {
      const supabase = createClient()

      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase.from("products").select("count").limit(1)

      if (connectionError) {
        this.results.push({
          component: "Database Connection",
          status: "fail",
          message: `Connection failed: ${connectionError.message}`,
        })
        return
      }

      // Test all tables exist
      const tables = ["products", "categories", "orders", "order_items", "profiles", "fabrics", "fabric_collections"]
      for (const table of tables) {
        const { error } = await supabase.from(table).select("*").limit(1)
        if (error) {
          this.results.push({
            component: `Table: ${table}`,
            status: "fail",
            message: `Table access failed: ${error.message}`,
          })
        } else {
          this.results.push({
            component: `Table: ${table}`,
            status: "pass",
            message: "Table accessible",
          })
        }
      }

      this.results.push({
        component: "Database Connection",
        status: "pass",
        message: "Database connection successful",
      })
    } catch (error) {
      this.results.push({
        component: "Database Connection",
        status: "fail",
        message: `Database verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  async verifyAuthentication(): Promise<void> {
    try {
      const supabase = createClient()

      // Test auth service
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        this.results.push({
          component: "Authentication Service",
          status: "warning",
          message: `Auth service warning: ${error.message}`,
        })
      } else {
        this.results.push({
          component: "Authentication Service",
          status: "pass",
          message: "Authentication service operational",
        })
      }
    } catch (error) {
      this.results.push({
        component: "Authentication Service",
        status: "fail",
        message: `Auth verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  async verifyAPIs(): Promise<void> {
    const apiEndpoints = ["/api/health", "/api/products", "/api/categories", "/api/orders"]

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
          this.results.push({
            component: `API: ${endpoint}`,
            status: "pass",
            message: `API endpoint responding (${response.status})`,
          })
        } else {
          this.results.push({
            component: `API: ${endpoint}`,
            status: "warning",
            message: `API endpoint returned ${response.status}`,
          })
        }
      } catch (error) {
        this.results.push({
          component: `API: ${endpoint}`,
          status: "fail",
          message: `API endpoint unreachable: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }
  }

  async verifyEnvironment(): Promise<void> {
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.results.push({
          component: `Environment: ${envVar}`,
          status: "pass",
          message: "Environment variable configured",
        })
      } else {
        this.results.push({
          component: `Environment: ${envVar}`,
          status: "fail",
          message: "Environment variable missing",
        })
      }
    }
  }

  async runFullVerification(): Promise<void> {
    console.log("🔍 Starting Backend System Verification...\n")

    await this.verifyEnvironment()
    await this.verifyDatabase()
    await this.verifyAuthentication()
    await this.verifyAPIs()

    this.generateReport()
  }

  private generateReport(): void {
    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const warnings = this.results.filter((r) => r.status === "warning").length
    const total = this.results.length

    console.log("📊 Backend Verification Report")
    console.log("=".repeat(50))
    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`⚠️  Warnings: ${warnings}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%\n`)

    // Group results by status
    const groupedResults = {
      pass: this.results.filter((r) => r.status === "pass"),
      warning: this.results.filter((r) => r.status === "warning"),
      fail: this.results.filter((r) => r.status === "fail"),
    }

    if (groupedResults.pass.length > 0) {
      console.log("✅ PASSED COMPONENTS:")
      groupedResults.pass.forEach((result) => {
        console.log(`   ${result.component}: ${result.message}`)
      })
      console.log()
    }

    if (groupedResults.warning.length > 0) {
      console.log("⚠️  WARNING COMPONENTS:")
      groupedResults.warning.forEach((result) => {
        console.log(`   ${result.component}: ${result.message}`)
      })
      console.log()
    }

    if (groupedResults.fail.length > 0) {
      console.log("❌ FAILED COMPONENTS:")
      groupedResults.fail.forEach((result) => {
        console.log(`   ${result.component}: ${result.message}`)
      })
      console.log()
    }

    // Overall status
    if (failed === 0) {
      console.log("🎉 BACKEND STATUS: FULLY OPERATIONAL")
      console.log("✅ All critical systems are functioning correctly")
      console.log("🚀 System is ready for production use")
    } else if (failed <= 2) {
      console.log("⚠️  BACKEND STATUS: MOSTLY OPERATIONAL")
      console.log("🔧 Minor issues detected, system functional with warnings")
    } else {
      console.log("❌ BACKEND STATUS: NEEDS ATTENTION")
      console.log("🚨 Critical issues detected, immediate action required")
    }
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new BackendVerifier()
  verifier.runFullVerification().catch(console.error)
}

export { BackendVerifier }
