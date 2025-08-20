#!/usr/bin/env tsx

/**
 * Comprehensive Backend System Analysis
 * ตรวจสอบระบบหลังบ้านทั้งหมดเพื่อให้แน่ใจว่าพร้อมใช้งานจริง
 */

import { createClient } from "@supabase/supabase-js"

interface TestResult {
  component: string
  status: "PASS" | "FAIL" | "WARNING"
  message: string
  details?: any
  timestamp: string
}

class BackendAnalyzer {
  private results: TestResult[] = []
  private supabase: any

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    }
  }

  private addResult(component: string, status: "PASS" | "FAIL" | "WARNING", message: string, details?: any) {
    this.results.push({
      component,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    })
  }

  private log(message: string, type: "info" | "success" | "warning" | "error" = "info") {
    const colors = {
      info: "\x1b[36m", // Cyan
      success: "\x1b[32m", // Green
      warning: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
    }
    const reset = "\x1b[0m"
    console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${reset}`)
  }

  // 1. Database Connectivity Tests
  async testDatabaseConnectivity() {
    this.log("🔍 Testing Database Connectivity...", "info")

    try {
      // Test Supabase connection
      if (this.supabase) {
        const { data, error } = await this.supabase.from("system_settings").select("count").limit(1)

        if (error) {
          this.addResult("Database", "FAIL", `Supabase connection failed: ${error.message}`, error)
        } else {
          this.addResult("Database", "PASS", "Supabase connection successful")
        }
      } else {
        this.addResult("Database", "FAIL", "Supabase client not initialized - missing env vars")
      }

      // Test Redis connection
      const redisUrl = process.env.KV_REST_API_URL
      const redisToken = process.env.KV_REST_API_TOKEN

      if (redisUrl && redisToken) {
        try {
          const response = await fetch(`${redisUrl}/ping`, {
            headers: { Authorization: `Bearer ${redisToken}` },
          })
          if (response.ok) {
            this.addResult("Redis", "PASS", "Redis connection successful")
          } else {
            this.addResult("Redis", "FAIL", `Redis connection failed: ${response.statusText}`)
          }
        } catch (error: any) {
          this.addResult("Redis", "FAIL", `Redis connection error: ${error.message}`)
        }
      } else {
        this.addResult("Redis", "WARNING", "Redis env vars not configured")
      }
    } catch (error: any) {
      this.addResult("Database", "FAIL", `Database test failed: ${error.message}`, error)
    }
  }

  // 2. Core Tables Structure Validation
  async testDatabaseSchema() {
    this.log("🗄️ Testing Database Schema...", "info")

    const criticalTables = [
      "profiles",
      "products",
      "orders",
      "order_items",
      "cart_items",
      "categories",
      "fabrics",
      "fabric_collections",
      "notifications",
      "system_settings",
      "customer_reviews",
      "wishlists",
    ]

    try {
      for (const table of criticalTables) {
        const { data, error } = await this.supabase.from(table).select("*").limit(1)

        if (error) {
          this.addResult("Schema", "FAIL", `Table ${table} not accessible: ${error.message}`)
        } else {
          this.addResult("Schema", "PASS", `Table ${table} accessible`)
        }
      }
    } catch (error: any) {
      this.addResult("Schema", "FAIL", `Schema validation failed: ${error.message}`)
    }
  }

  // 3. Authentication System Test
  async testAuthenticationSystem() {
    this.log("🔐 Testing Authentication System...", "info")

    try {
      // Test if auth is configured
      const {
        data: { users },
        error,
      } = await this.supabase.auth.admin.listUsers()

      if (error) {
        this.addResult("Auth", "FAIL", `Auth system error: ${error.message}`)
      } else {
        this.addResult("Auth", "PASS", `Auth system working - ${users?.length || 0} users found`)
      }

      // Test profiles table integration
      const { data: profiles, error: profileError } = await this.supabase.from("profiles").select("*").limit(5)

      if (profileError) {
        this.addResult("Auth", "WARNING", `Profiles table issue: ${profileError.message}`)
      } else {
        this.addResult("Auth", "PASS", `Profiles integration working - ${profiles?.length || 0} profiles`)
      }
    } catch (error: any) {
      this.addResult("Auth", "FAIL", `Auth test failed: ${error.message}`)
    }
  }

  // 4. E-commerce Core Functions Test
  async testEcommerceFunctions() {
    this.log("🛒 Testing E-commerce Functions...", "info")

    try {
      // Test products
      const { data: products, error: productError } = await this.supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .limit(5)

      if (productError) {
        this.addResult("E-commerce", "FAIL", `Products query failed: ${productError.message}`)
      } else {
        this.addResult("E-commerce", "PASS", `Products working - ${products?.length || 0} active products`)
      }

      // Test categories
      const { data: categories, error: categoryError } = await this.supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)

      if (categoryError) {
        this.addResult("E-commerce", "FAIL", `Categories query failed: ${categoryError.message}`)
      } else {
        this.addResult("E-commerce", "PASS", `Categories working - ${categories?.length || 0} active categories`)
      }

      // Test orders
      const { data: orders, error: orderError } = await this.supabase
        .from("orders")
        .select("*, order_items(*)")
        .limit(5)

      if (orderError) {
        this.addResult("E-commerce", "WARNING", `Orders query issue: ${orderError.message}`)
      } else {
        this.addResult("E-commerce", "PASS", `Orders system working - ${orders?.length || 0} orders found`)
      }
    } catch (error: any) {
      this.addResult("E-commerce", "FAIL", `E-commerce test failed: ${error.message}`)
    }
  }

  // 5. Notification System Test
  async testNotificationSystem() {
    this.log("📧 Testing Notification System...", "info")

    try {
      // Test notifications table
      const { data: notifications, error: notifError } = await this.supabase
        .from("notifications")
        .select("*, notification_attempts(*)")
        .limit(10)

      if (notifError) {
        this.addResult("Notifications", "FAIL", `Notifications query failed: ${notifError.message}`)
      } else {
        this.addResult("Notifications", "PASS", `Notifications table working - ${notifications?.length || 0} records`)
      }

      // Test notification API endpoint
      try {
        const response = await fetch("/api/notifications/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: true }),
        })

        if (response.ok) {
          this.addResult("Notifications", "PASS", "Notification API endpoint accessible")
        } else {
          this.addResult("Notifications", "WARNING", `Notification API returned: ${response.status}`)
        }
      } catch (error: any) {
        this.addResult("Notifications", "WARNING", `Notification API test failed: ${error.message}`)
      }
    } catch (error: any) {
      this.addResult("Notifications", "FAIL", `Notification test failed: ${error.message}`)
    }
  }

  // 6. AI Chat System Test
  async testAIChatSystem() {
    this.log("🤖 Testing AI Chat System...", "info")

    try {
      // Test AI chat performance table
      const { data: chatPerf, error: chatError } = await this.supabase.from("ai_chat_performance").select("*").limit(5)

      if (chatError) {
        this.addResult("AI Chat", "WARNING", `AI chat performance table issue: ${chatError.message}`)
      } else {
        this.addResult("AI Chat", "PASS", `AI chat performance tracking working - ${chatPerf?.length || 0} records`)
      }

      // Test unified conversations
      const { data: conversations, error: convError } = await this.supabase
        .from("unified_conversations")
        .select("*, unified_messages(*)")
        .limit(5)

      if (convError) {
        this.addResult("AI Chat", "WARNING", `Conversations query issue: ${convError.message}`)
      } else {
        this.addResult("AI Chat", "PASS", `Unified conversations working - ${conversations?.length || 0} conversations`)
      }
    } catch (error: any) {
      this.addResult("AI Chat", "FAIL", `AI Chat test failed: ${error.message}`)
    }
  }

  // 7. Facebook Integration Test
  async testFacebookIntegration() {
    this.log("📘 Testing Facebook Integration...", "info")

    try {
      const { data: fbPages, error: fbError } = await this.supabase.from("facebook_pages").select("*")

      if (fbError) {
        this.addResult("Facebook", "WARNING", `Facebook pages query issue: ${fbError.message}`)
      } else {
        const activePages = fbPages?.filter((page) => page.webhook_verified) || []
        this.addResult(
          "Facebook",
          "PASS",
          `Facebook integration - ${fbPages?.length || 0} pages, ${activePages.length} verified`,
        )
      }
    } catch (error: any) {
      this.addResult("Facebook", "FAIL", `Facebook test failed: ${error.message}`)
    }
  }

  // 8. System Settings and Configuration Test
  async testSystemConfiguration() {
    this.log("⚙️ Testing System Configuration...", "info")

    try {
      const { data: settings, error: settingsError } = await this.supabase.from("system_settings").select("*")

      if (settingsError) {
        this.addResult("Configuration", "FAIL", `System settings query failed: ${settingsError.message}`)
      } else {
        this.addResult("Configuration", "PASS", `System settings working - ${settings?.length || 0} settings`)
      }

      // Check critical environment variables
      const criticalEnvVars = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "KV_REST_API_URL",
        "KV_REST_API_TOKEN",
      ]

      const missingEnvVars = []
      for (const envVar of criticalEnvVars) {
        if (!process.env[envVar]) {
          missingEnvVars.push(envVar)
        }
      }

      if (missingEnvVars.length > 0) {
        this.addResult("Configuration", "WARNING", `Missing env vars: ${missingEnvVars.join(", ")}`)
      } else {
        this.addResult("Configuration", "PASS", "All critical environment variables present")
      }
    } catch (error: any) {
      this.addResult("Configuration", "FAIL", `Configuration test failed: ${error.message}`)
    }
  }

  // 9. Performance and Monitoring Test
  async testPerformanceMonitoring() {
    this.log("📊 Testing Performance Monitoring...", "info")

    try {
      // Test bug reports system
      const { data: bugReports, error: bugError } = await this.supabase.from("bug_reports").select("*").limit(5)

      if (bugError) {
        this.addResult("Monitoring", "WARNING", `Bug reports query issue: ${bugError.message}`)
      } else {
        this.addResult("Monitoring", "PASS", `Bug reporting system working - ${bugReports?.length || 0} reports`)
      }

      // Test user feedback system
      const { data: feedback, error: feedbackError } = await this.supabase.from("user_feedback").select("*").limit(5)

      if (feedbackError) {
        this.addResult("Monitoring", "WARNING", `User feedback query issue: ${feedbackError.message}`)
      } else {
        this.addResult("Monitoring", "PASS", `User feedback system working - ${feedback?.length || 0} feedback`)
      }
    } catch (error: any) {
      this.addResult("Monitoring", "FAIL", `Monitoring test failed: ${error.message}`)
    }
  }

  // Generate comprehensive report
  generateReport() {
    this.log("\n📋 COMPREHENSIVE BACKEND ANALYSIS REPORT", "info")
    this.log("=".repeat(60), "info")

    const summary = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "PASS").length,
      failed: this.results.filter((r) => r.status === "FAIL").length,
      warnings: this.results.filter((r) => r.status === "WARNING").length,
    }

    this.log(`\n📊 SUMMARY:`, "info")
    this.log(`✅ PASSED: ${summary.passed}`, "success")
    this.log(`⚠️  WARNINGS: ${summary.warnings}`, "warning")
    this.log(`❌ FAILED: ${summary.failed}`, "error")
    this.log(`📈 TOTAL TESTS: ${summary.total}`, "info")

    this.log(`\n📝 DETAILED RESULTS:`, "info")
    this.log("-".repeat(60), "info")

    // Group results by component
    const groupedResults = this.results.reduce(
      (acc, result) => {
        if (!acc[result.component]) {
          acc[result.component] = []
        }
        acc[result.component].push(result)
        return acc
      },
      {} as Record<string, TestResult[]>,
    )

    for (const [component, results] of Object.entries(groupedResults)) {
      this.log(`\n🔧 ${component.toUpperCase()}:`, "info")

      for (const result of results) {
        const icon = result.status === "PASS" ? "✅" : result.status === "WARNING" ? "⚠️" : "❌"
        const type = result.status === "PASS" ? "success" : result.status === "WARNING" ? "warning" : "error"
        this.log(`  ${icon} ${result.message}`, type)

        if (result.details && result.status === "FAIL") {
          this.log(`     Details: ${JSON.stringify(result.details, null, 2)}`, "error")
        }
      }
    }

    // Critical issues that need immediate attention
    const criticalIssues = this.results.filter((r) => r.status === "FAIL")
    if (criticalIssues.length > 0) {
      this.log(`\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:`, "error")
      this.log("=".repeat(60), "error")

      criticalIssues.forEach((issue, index) => {
        this.log(`${index + 1}. [${issue.component}] ${issue.message}`, "error")
      })
    }

    // Recommendations
    this.log(`\n💡 RECOMMENDATIONS:`, "info")
    this.log("-".repeat(60), "info")

    if (summary.failed === 0 && summary.warnings === 0) {
      this.log("🎉 Excellent! All systems are functioning properly.", "success")
      this.log("✅ Your backend is ready for production use.", "success")
    } else {
      if (summary.failed > 0) {
        this.log("🔴 Address all FAILED tests before going to production.", "error")
      }
      if (summary.warnings > 0) {
        this.log("🟡 Review WARNING items for optimal performance.", "warning")
      }
    }

    this.log(`\n⏰ Analysis completed at: ${new Date().toLocaleString("th-TH")}`, "info")
    this.log("=".repeat(60), "info")

    return {
      summary,
      results: this.results,
      criticalIssues,
      isProductionReady: summary.failed === 0,
    }
  }

  // Main execution method
  async runFullAnalysis() {
    this.log("🚀 Starting Comprehensive Backend Analysis...", "info")
    this.log(`📅 Started at: ${new Date().toLocaleString("th-TH")}`, "info")
    this.log("=".repeat(60), "info")

    try {
      await this.testDatabaseConnectivity()
      await this.testDatabaseSchema()
      await this.testAuthenticationSystem()
      await this.testEcommerceFunctions()
      await this.testNotificationSystem()
      await this.testAIChatSystem()
      await this.testFacebookIntegration()
      await this.testSystemConfiguration()
      await this.testPerformanceMonitoring()

      return this.generateReport()
    } catch (error: any) {
      this.log(`❌ Analysis failed: ${error.message}`, "error")
      this.addResult("System", "FAIL", `Analysis execution failed: ${error.message}`, error)
      return this.generateReport()
    }
  }
}

// Execute the analysis
async function main() {
  const analyzer = new BackendAnalyzer()
  const report = await analyzer.runFullAnalysis()

  // Save report to file for future reference
  const fs = await import("fs")
  const reportPath = `./backend-analysis-report-${Date.now()}.json`

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Full report saved to: ${reportPath}`)
  } catch (error) {
    console.log(`⚠️ Could not save report file: ${error}`)
  }

  // Exit with appropriate code
  process.exit(report.isProductionReady ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}

export { BackendAnalyzer }
