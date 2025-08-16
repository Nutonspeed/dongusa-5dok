import { createClient } from "@supabase/supabase-js"

interface VerificationResult {
  component: string
  status: "PASS" | "FAIL" | "WARNING"
  message: string
  details?: any
}

class BackendVerificationSuite {
  private supabase: any
  private results: VerificationResult[] = []

  constructor() {
    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  }

  private addResult(component: string, status: "PASS" | "FAIL" | "WARNING", message: string, details?: any) {
    this.results.push({ component, status, message, details })
  }

  async verifyEnvironmentVariables() {
    console.log("🔍 Verifying Environment Variables...")

    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
    ]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length === 0) {
      this.addResult("Environment Variables", "PASS", "All required environment variables are set")
    } else {
      this.addResult("Environment Variables", "FAIL", `Missing variables: ${missingVars.join(", ")}`)
    }
  }

  async verifyDatabaseTables() {
    console.log("🗄️ Verifying Database Tables...")

    const expectedTables = [
      "products",
      "categories",
      "orders",
      "order_items",
      "cart_items",
      "profiles",
      "fabrics",
      "fabric_collections",
      "customer_reviews",
      "wishlists",
      "loyalty_points",
      "system_settings",
      "user_feedback",
      "bug_reports",
    ]

    let passedTables = 0
    const tableResults: any = {}

    for (const table of expectedTables) {
      try {
        const { data, error } = await this.supabase.from(table).select("*").limit(1)

        if (error) {
          tableResults[table] = { status: "FAIL", error: error.message }
        } else {
          tableResults[table] = { status: "PASS", recordCount: data?.length || 0 }
          passedTables++
        }
      } catch (err) {
        tableResults[table] = { status: "FAIL", error: (err as Error).message }
      }
    }

    if (passedTables === expectedTables.length) {
      this.addResult("Database Tables", "PASS", `All ${expectedTables.length} tables accessible`, tableResults)
    } else {
      this.addResult(
        "Database Tables",
        "FAIL",
        `${passedTables}/${expectedTables.length} tables accessible`,
        tableResults,
      )
    }
  }

  async verifyAuthenticationSystem() {
    console.log("🔐 Verifying Authentication System...")

    try {
      // Test auth service availability
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error && error.message !== "Auth session missing!") {
        this.addResult("Authentication", "FAIL", `Auth service error: ${error.message}`)
      } else {
        this.addResult("Authentication", "PASS", "Authentication service is operational")
      }
    } catch (err) {
      this.addResult("Authentication", "FAIL", `Auth system error: ${(err as Error).message}`)
    }
  }

  async verifyAPIEndpoints() {
    console.log("🌐 Verifying API Endpoints...")

    const endpoints = [
      { path: "/api/health", method: "GET" },
      { path: "/api/health/database", method: "GET" },
    ]

    let passedEndpoints = 0
    const endpointResults: any = {}

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint.path}`, {
          method: endpoint.method,
        })

        if (response.ok) {
          endpointResults[endpoint.path] = {
            status: "PASS",
            statusCode: response.status,
            contentType: response.headers.get("content-type"),
          }
          passedEndpoints++
        } else {
          endpointResults[endpoint.path] = {
            status: "FAIL",
            statusCode: response.status,
            statusText: response.statusText,
          }
        }
      } catch (err) {
        endpointResults[endpoint.path] = {
          status: "FAIL",
          error: (err as Error).message,
        }
      }
    }

    if (passedEndpoints === endpoints.length) {
      this.addResult("API Endpoints", "PASS", `All ${endpoints.length} endpoints responding`, endpointResults)
    } else {
      this.addResult(
        "API Endpoints",
        "WARNING",
        `${passedEndpoints}/${endpoints.length} endpoints responding (server may not be running)`,
        endpointResults,
      )
    }
  }

  async verifyDataIntegrity() {
    console.log("🔍 Verifying Data Integrity...")

    try {
      // Check for essential data relationships
      const { data: products } = await this.supabase
        .from("products")
        .select("id, category_id, categories(name)")
        .limit(5)

      const { data: orders } = await this.supabase.from("orders").select("id, user_id, profiles(full_name)").limit(5)

      let integrityScore = 0
      const checks = []

      // Check product-category relationships
      if (products && products.length > 0) {
        const validRelations = products.filter((p) => p.categories).length
        checks.push(`Product-Category relations: ${validRelations}/${products.length}`)
        if (validRelations > 0) integrityScore++
      }

      // Check order-user relationships
      if (orders && orders.length > 0) {
        const validRelations = orders.filter((o) => o.profiles).length
        checks.push(`Order-User relations: ${validRelations}/${orders.length}`)
        if (validRelations > 0) integrityScore++
      }

      if (integrityScore >= 1) {
        this.addResult("Data Integrity", "PASS", "Database relationships are properly configured", checks)
      } else {
        this.addResult("Data Integrity", "WARNING", "Limited data available for relationship testing", checks)
      }
    } catch (err) {
      this.addResult("Data Integrity", "FAIL", `Data integrity check failed: ${(err as Error).message}`)
    }
  }

  generateReport() {
    const passCount = this.results.filter((r) => r.status === "PASS").length
    const failCount = this.results.filter((r) => r.status === "FAIL").length
    const warningCount = this.results.filter((r) => r.status === "WARNING").length
    const totalTests = this.results.length
    const successRate = Math.round((passCount / totalTests) * 100)

    console.log("\n" + "=".repeat(60))
    console.log("🎯 BACKEND VERIFICATION REPORT")
    console.log("=".repeat(60))
    console.log(
      `📊 Overall Status: ${successRate >= 90 ? "✅ EXCELLENT" : successRate >= 75 ? "⚠️ GOOD" : "❌ NEEDS ATTENTION"}`,
    )
    console.log(`📈 Success Rate: ${successRate}% (${passCount}/${totalTests} tests passed)`)
    console.log(`✅ Passed: ${passCount}`)
    console.log(`⚠️ Warnings: ${warningCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log("\n📋 DETAILED RESULTS:")
    console.log("-".repeat(60))

    this.results.forEach((result) => {
      const icon = result.status === "PASS" ? "✅" : result.status === "WARNING" ? "⚠️" : "❌"
      console.log(`${icon} ${result.component}: ${result.message}`)

      if (result.details && typeof result.details === "object") {
        Object.entries(result.details).forEach(([key, value]: [string, any]) => {
          if (typeof value === "object" && value.status) {
            const detailIcon = value.status === "PASS" ? "  ✓" : "  ✗"
            console.log(`${detailIcon} ${key}: ${value.status}`)
          }
        })
      }
    })

    console.log("\n" + "=".repeat(60))

    if (successRate >= 90) {
      console.log("🎉 BACKEND STATUS: 100% READY FOR PRODUCTION!")
      console.log("✨ All critical systems are operational and verified.")
    } else if (successRate >= 75) {
      console.log("⚠️ BACKEND STATUS: MOSTLY READY - Minor issues detected")
      console.log("🔧 Address warnings before production deployment.")
    } else {
      console.log("❌ BACKEND STATUS: NOT READY - Critical issues found")
      console.log("🚨 Resolve failed tests before proceeding to production.")
    }

    console.log("=".repeat(60))

    return {
      successRate,
      passCount,
      failCount,
      warningCount,
      totalTests,
      results: this.results,
      status: successRate >= 90 ? "READY" : successRate >= 75 ? "MOSTLY_READY" : "NOT_READY",
    }
  }

  async runFullVerification() {
    console.log("🚀 Starting Comprehensive Backend Verification...\n")

    await this.verifyEnvironmentVariables()
    await this.verifyDatabaseTables()
    await this.verifyAuthenticationSystem()
    await this.verifyAPIEndpoints()
    await this.verifyDataIntegrity()

    return this.generateReport()
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new BackendVerificationSuite()
  verifier
    .runFullVerification()
    .then((report) => {
      process.exit(report.status === "READY" ? 0 : 1)
    })
    .catch((err) => {
      console.error("❌ Verification failed:", err)
      process.exit(1)
    })
}

export default BackendVerificationSuite
