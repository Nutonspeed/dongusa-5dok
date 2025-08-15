#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

interface TestResult {
  name: string
  status: "PASS" | "FAIL" | "WARNING"
  message: string
  details?: string
}

class SystemTester {
  private results: TestResult[] = []
  private supabase: any

  constructor() {
    // Initialize Supabase client for testing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    }
  }

  private addResult(name: string, status: "PASS" | "FAIL" | "WARNING", message: string, details?: string) {
    this.results.push({ name, status, message, details })
  }

  async testFileStructure() {
    console.log("🔍 Testing file structure...")

    const requiredFiles = [
      "app/layout.tsx",
      "app/page.tsx",
      "app/globals.css",
      "package.json",
      "next.config.mjs",
      "tailwind.config.ts",
      "tsconfig.json",
      "middleware.ts",
      "lib/supabase/client.ts",
      "lib/supabase/server.ts",
      "app/contexts/AuthContext.tsx",
      "app/contexts/CartContext.tsx",
      "app/contexts/LanguageContext.tsx",
    ]

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.addResult(`File: ${file}`, "PASS", "File exists")
      } else {
        this.addResult(`File: ${file}`, "FAIL", "Required file missing")
      }
    }
  }

  async testEnvironmentVariables() {
    console.log("🔍 Testing environment variables...")

    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.addResult(`Env: ${envVar}`, "PASS", "Environment variable set")
      } else {
        this.addResult(`Env: ${envVar}`, "WARNING", "Environment variable not set")
      }
    }
  }

  async testSupabaseConnection() {
    console.log("🔍 Testing Supabase connection...")

    if (!this.supabase) {
      this.addResult("Supabase Connection", "FAIL", "Supabase client not initialized")
      return
    }

    try {
      const { data, error } = await this.supabase.from("products").select("count").limit(1)

      if (error) {
        this.addResult("Supabase Connection", "FAIL", `Connection failed: ${error.message}`)
      } else {
        this.addResult("Supabase Connection", "PASS", "Successfully connected to Supabase")
      }
    } catch (error) {
      this.addResult("Supabase Connection", "FAIL", `Connection error: ${error}`)
    }
  }

  async testDatabaseSchema() {
    console.log("🔍 Testing database schema...")

    if (!this.supabase) {
      this.addResult("Database Schema", "FAIL", "Supabase client not available")
      return
    }

    const requiredTables = ["products", "categories", "orders", "order_items", "profiles"]

    for (const table of requiredTables) {
      try {
        const { data, error } = await this.supabase.from(table).select("*").limit(1)

        if (error) {
          this.addResult(`Table: ${table}`, "FAIL", `Table access failed: ${error.message}`)
        } else {
          this.addResult(`Table: ${table}`, "PASS", "Table accessible")
        }
      } catch (error) {
        this.addResult(`Table: ${table}`, "FAIL", `Table error: ${error}`)
      }
    }
  }

  async testComponentStructure() {
    console.log("🔍 Testing component structure...")

    const requiredComponents = [
      "app/components/Header.tsx",
      "app/components/Footer.tsx",
      "app/components/Hero.tsx",
      "app/components/FeaturedProducts.tsx",
      "components/ui/button.tsx",
      "components/ui/card.tsx",
    ]

    for (const component of requiredComponents) {
      if (fs.existsSync(component)) {
        this.addResult(`Component: ${path.basename(component)}`, "PASS", "Component exists")
      } else {
        this.addResult(`Component: ${path.basename(component)}`, "WARNING", "Component missing")
      }
    }
  }

  async testAdminSystem() {
    console.log("🔍 Testing admin system...")

    const adminFiles = ["app/admin/layout.tsx", "app/admin/page.tsx", "app/admin/login/page.tsx"]

    for (const file of adminFiles) {
      if (fs.existsSync(file)) {
        this.addResult(`Admin: ${path.basename(file)}`, "PASS", "Admin file exists")
      } else {
        this.addResult(`Admin: ${path.basename(file)}`, "FAIL", "Admin file missing")
      }
    }
  }

  async testEcommerceFlow() {
    console.log("🔍 Testing e-commerce flow...")

    const ecommerceFiles = [
      "app/products/page.tsx",
      "app/cart/page.tsx",
      "app/checkout/page.tsx",
      "app/orders/page.tsx",
    ]

    for (const file of ecommerceFiles) {
      if (fs.existsSync(file)) {
        this.addResult(`E-commerce: ${path.basename(file)}`, "PASS", "E-commerce page exists")
      } else {
        this.addResult(`E-commerce: ${path.basename(file)}`, "FAIL", "E-commerce page missing")
      }
    }
  }

  generateReport() {
    console.log("\n📊 Generating test report...")

    const totalTests = this.results.length
    const passedTests = this.results.filter((r) => r.status === "PASS").length
    const failedTests = this.results.filter((r) => r.status === "FAIL").length
    const warningTests = this.results.filter((r) => r.status === "WARNING").length

    const report = `# SofaCover Pro System Test Report

Generated: ${new Date().toISOString()}

## Summary
- Total Tests: ${totalTests}
- Passed: ${passedTests} ✅
- Failed: ${failedTests} ❌
- Warnings: ${warningTests} ⚠️
- Success Rate: ${Math.round((passedTests / totalTests) * 100)}%

## Test Results

${this.results
  .map((result) => {
    const icon = result.status === "PASS" ? "✅" : result.status === "FAIL" ? "❌" : "⚠️"
    return `### ${icon} ${result.name}
**Status:** ${result.status}
**Message:** ${result.message}
${result.details ? `**Details:** ${result.details}` : ""}
`
  })
  .join("\n")}

## Recommendations

${
  failedTests > 0
    ? `
### Critical Issues (${failedTests})
${this.results
  .filter((r) => r.status === "FAIL")
  .map((r) => `- ${r.name}: ${r.message}`)
  .join("\n")}
`
    : ""
}

${
  warningTests > 0
    ? `
### Warnings (${warningTests})
${this.results
  .filter((r) => r.status === "WARNING")
  .map((r) => `- ${r.name}: ${r.message}`)
  .join("\n")}
`
    : ""
}

## Next Steps

1. Fix all critical issues before deployment
2. Address warnings for optimal performance
3. Run tests again to verify fixes
4. Deploy to production when all tests pass

---
*Generated by SofaCover Pro System Tester*
`

    // Write report to file
    fs.writeFileSync("docs/FINAL_SYSTEM_TEST_REPORT.md", report)

    return {
      totalTests,
      passedTests,
      failedTests,
      warningTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      report,
    }
  }

  async runAllTests() {
    console.log("🚀 Starting comprehensive system test...\n")

    await this.testFileStructure()
    await this.testEnvironmentVariables()
    await this.testSupabaseConnection()
    await this.testDatabaseSchema()
    await this.testComponentStructure()
    await this.testAdminSystem()
    await this.testEcommerceFlow()

    const summary = this.generateReport()

    console.log("\n📋 Test Summary:")
    console.log(`Total Tests: ${summary.totalTests}`)
    console.log(`Passed: ${summary.passedTests} ✅`)
    console.log(`Failed: ${summary.failedTests} ❌`)
    console.log(`Warnings: ${summary.warningTests} ⚠️`)
    console.log(`Success Rate: ${summary.successRate}%`)

    if (summary.failedTests > 0) {
      console.log("\n❌ System has critical issues that need to be fixed before deployment")
      process.exit(1)
    } else if (summary.warningTests > 0) {
      console.log("\n⚠️ System is functional but has warnings that should be addressed")
    } else {
      console.log("\n✅ All tests passed! System is ready for deployment")
    }

    return summary
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SystemTester()
  tester.runAllTests().catch(console.error)
}

export default SystemTester
