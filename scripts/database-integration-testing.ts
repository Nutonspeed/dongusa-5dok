#!/usr/bin/env tsx

/**
 * Database & Integration Testing Suite
 * ทดสอบการทำงานของฐานข้อมูลและการเชื่อมต่อระหว่างระบบต่างๆ
 */

import { createClient } from "@supabase/supabase-js"

interface DatabaseTestResult {
  test: string
  status: "PASS" | "FAIL" | "WARNING"
  message: string
  executionTime?: number
  details?: any
  timestamp: string
}

class DatabaseIntegrationTester {
  private results: DatabaseTestResult[] = []
  private supabase: any
  private testUserId: string | null = null

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    }
  }

  private addResult(
    test: string,
    status: "PASS" | "FAIL" | "WARNING",
    message: string,
    executionTime?: number,
    details?: any,
  ) {
    this.results.push({
      test,
      status,
      message,
      executionTime,
      details,
      timestamp: new Date().toISOString(),
    })
  }

  private log(message: string, type: "info" | "success" | "warning" | "error" = "info") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      warning: "\x1b[33m",
      error: "\x1b[31m",
    }
    const reset = "\x1b[0m"
    console.log(`${colors[type]}[DB-TEST] ${message}${reset}`)
  }

  private async measureExecutionTime<T>(operation: () => Promise<T>): Promise<{ result: T; executionTime: number }> {
    const startTime = Date.now()
    const result = await operation()
    const executionTime = Date.now() - startTime
    return { result, executionTime }
  }

  // 1. Basic CRUD Operations Test
  async testBasicCRUDOperations() {
    this.log("🔧 Testing Basic CRUD Operations...", "info")

    try {
      // CREATE - Test creating a test profile
      const testEmail = `test-${Date.now()}@example.com`
      const { result: createResult, executionTime: createTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("profiles")
          .insert({
            email: testEmail,
            full_name: "Test User",
            role: "customer",
          })
          .select()
          .single()
      })

      if (createResult.error) {
        this.addResult("CRUD-CREATE", "FAIL", `Create operation failed: ${createResult.error.message}`, createTime)
      } else {
        this.testUserId = createResult.data.id
        this.addResult("CRUD-CREATE", "PASS", "Create operation successful", createTime)
      }

      // READ - Test reading the created profile
      if (this.testUserId) {
        const { result: readResult, executionTime: readTime } = await this.measureExecutionTime(async () => {
          return await this.supabase.from("profiles").select("*").eq("id", this.testUserId).single()
        })

        if (readResult.error) {
          this.addResult("CRUD-READ", "FAIL", `Read operation failed: ${readResult.error.message}`, readTime)
        } else {
          this.addResult("CRUD-READ", "PASS", "Read operation successful", readTime)
        }

        // UPDATE - Test updating the profile
        const { result: updateResult, executionTime: updateTime } = await this.measureExecutionTime(async () => {
          return await this.supabase
            .from("profiles")
            .update({ full_name: "Updated Test User" })
            .eq("id", this.testUserId)
            .select()
            .single()
        })

        if (updateResult.error) {
          this.addResult("CRUD-UPDATE", "FAIL", `Update operation failed: ${updateResult.error.message}`, updateTime)
        } else {
          this.addResult("CRUD-UPDATE", "PASS", "Update operation successful", updateTime)
        }

        // DELETE - Test deleting the profile
        const { result: deleteResult, executionTime: deleteTime } = await this.measureExecutionTime(async () => {
          return await this.supabase.from("profiles").delete().eq("id", this.testUserId)
        })

        if (deleteResult.error) {
          this.addResult("CRUD-DELETE", "FAIL", `Delete operation failed: ${deleteResult.error.message}`, deleteTime)
        } else {
          this.addResult("CRUD-DELETE", "PASS", "Delete operation successful", deleteTime)
        }
      }
    } catch (error: any) {
      this.addResult("CRUD-OPERATIONS", "FAIL", `CRUD test failed: ${error.message}`, 0, error)
    }
  }

  // 2. Complex Query Performance Test
  async testComplexQueryPerformance() {
    this.log("⚡ Testing Complex Query Performance...", "info")

    try {
      // Test complex product query with joins
      const { result: productQuery, executionTime: productTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("products")
          .select(`
            *,
            categories(name, slug),
            customer_reviews(rating, comment)
          `)
          .eq("is_active", true)
          .limit(10)
      })

      if (productQuery.error) {
        this.addResult(
          "COMPLEX-QUERY",
          "FAIL",
          `Complex product query failed: ${productQuery.error.message}`,
          productTime,
        )
      } else {
        const performanceStatus = productTime < 1000 ? "PASS" : productTime < 3000 ? "WARNING" : "FAIL"
        this.addResult("COMPLEX-QUERY", performanceStatus, `Complex query completed in ${productTime}ms`, productTime)
      }

      // Test order aggregation query
      const { result: orderQuery, executionTime: orderTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("orders")
          .select(`
            *,
            order_items(*, products(name, price)),
            profiles(full_name, email)
          `)
          .limit(5)
      })

      if (orderQuery.error) {
        this.addResult(
          "ORDER-AGGREGATION",
          "FAIL",
          `Order aggregation query failed: ${orderQuery.error.message}`,
          orderTime,
        )
      } else {
        const performanceStatus = orderTime < 1500 ? "PASS" : orderTime < 4000 ? "WARNING" : "FAIL"
        this.addResult(
          "ORDER-AGGREGATION",
          performanceStatus,
          `Order aggregation completed in ${orderTime}ms`,
          orderTime,
        )
      }

      // Test conversation with messages query
      const { result: conversationQuery, executionTime: conversationTime } = await this.measureExecutionTime(
        async () => {
          return await this.supabase
            .from("unified_conversations")
            .select(`
            *,
            unified_messages(*)
          `)
            .limit(5)
        },
      )

      if (conversationQuery.error) {
        this.addResult(
          "CONVERSATION-QUERY",
          "WARNING",
          `Conversation query issue: ${conversationQuery.error.message}`,
          conversationTime,
        )
      } else {
        const performanceStatus = conversationTime < 2000 ? "PASS" : conversationTime < 5000 ? "WARNING" : "FAIL"
        this.addResult(
          "CONVERSATION-QUERY",
          performanceStatus,
          `Conversation query completed in ${conversationTime}ms`,
          conversationTime,
        )
      }
    } catch (error: any) {
      this.addResult("QUERY-PERFORMANCE", "FAIL", `Query performance test failed: ${error.message}`, 0, error)
    }
  }

  // 3. Data Integrity and Constraints Test
  async testDataIntegrityConstraints() {
    this.log("🔒 Testing Data Integrity and Constraints...", "info")

    try {
      // Test foreign key constraints
      const { result: fkTest, executionTime: fkTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("cart_items").insert({
          user_id: "00000000-0000-0000-0000-000000000000", // Non-existent user
          product_id: "00000000-0000-0000-0000-000000000000", // Non-existent product
          quantity: 1,
          price: 100,
        })
      })

      if (fkTest.error && fkTest.error.message.includes("foreign key")) {
        this.addResult("DATA-INTEGRITY", "PASS", "Foreign key constraints working properly", fkTime)
      } else if (fkTest.error) {
        this.addResult("DATA-INTEGRITY", "WARNING", `Unexpected constraint error: ${fkTest.error.message}`, fkTime)
      } else {
        this.addResult("DATA-INTEGRITY", "FAIL", "Foreign key constraints not enforced", fkTime)
      }

      // Test required field constraints
      const { result: requiredTest, executionTime: requiredTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("products").insert({
          // Missing required fields like name, price
          description: "Test product without required fields",
        })
      })

      if (requiredTest.error) {
        this.addResult("REQUIRED-FIELDS", "PASS", "Required field constraints working", requiredTime)
      } else {
        this.addResult("REQUIRED-FIELDS", "FAIL", "Required field constraints not enforced", requiredTime)
      }

      // Test unique constraints
      const { result: uniqueTest, executionTime: uniqueTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("categories").insert([
          { name: "Test Category", slug: "test-category-unique" },
          { name: "Test Category 2", slug: "test-category-unique" }, // Duplicate slug
        ])
      })

      if (uniqueTest.error && uniqueTest.error.message.includes("unique")) {
        this.addResult("UNIQUE-CONSTRAINTS", "PASS", "Unique constraints working properly", uniqueTime)
      } else if (uniqueTest.error) {
        this.addResult(
          "UNIQUE-CONSTRAINTS",
          "WARNING",
          `Unexpected unique constraint error: ${uniqueTest.error.message}`,
          uniqueTime,
        )
      } else {
        this.addResult("UNIQUE-CONSTRAINTS", "FAIL", "Unique constraints not enforced", uniqueTime)
      }
    } catch (error: any) {
      this.addResult("DATA-INTEGRITY", "FAIL", `Data integrity test failed: ${error.message}`, 0, error)
    }
  }

  // 4. Redis Integration Test
  async testRedisIntegration() {
    this.log("🔴 Testing Redis Integration...", "info")

    const redisUrl = process.env.KV_REST_API_URL
    const redisToken = process.env.KV_REST_API_TOKEN

    if (!redisUrl || !redisToken) {
      this.addResult("REDIS-CONFIG", "WARNING", "Redis configuration not found")
      return
    }

    try {
      // Test Redis SET operation
      const testKey = `test-key-${Date.now()}`
      const testValue = { message: "Hello Redis", timestamp: Date.now() }

      const { result: setResult, executionTime: setTime } = await this.measureExecutionTime(async () => {
        const response = await fetch(`${redisUrl}/set/${testKey}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${redisToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testValue),
        })
        return response
      })

      if (setResult.ok) {
        this.addResult("REDIS-SET", "PASS", `Redis SET operation successful in ${setTime}ms`, setTime)
      } else {
        this.addResult("REDIS-SET", "FAIL", `Redis SET failed: ${setResult.statusText}`, setTime)
      }

      // Test Redis GET operation
      const { result: getResult, executionTime: getTime } = await this.measureExecutionTime(async () => {
        const response = await fetch(`${redisUrl}/get/${testKey}`, {
          headers: { Authorization: `Bearer ${redisToken}` },
        })
        return response
      })

      if (getResult.ok) {
        const data = await getResult.json()
        this.addResult("REDIS-GET", "PASS", `Redis GET operation successful in ${getTime}ms`, getTime)
      } else {
        this.addResult("REDIS-GET", "FAIL", `Redis GET failed: ${getResult.statusText}`, getTime)
      }

      // Test Redis DELETE operation
      const { result: delResult, executionTime: delTime } = await this.measureExecutionTime(async () => {
        const response = await fetch(`${redisUrl}/del/${testKey}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${redisToken}` },
        })
        return response
      })

      if (delResult.ok) {
        this.addResult("REDIS-DELETE", "PASS", `Redis DELETE operation successful in ${delTime}ms`, delTime)
      } else {
        this.addResult("REDIS-DELETE", "FAIL", `Redis DELETE failed: ${delResult.statusText}`, delTime)
      }
    } catch (error: any) {
      this.addResult("REDIS-INTEGRATION", "FAIL", `Redis integration test failed: ${error.message}`, 0, error)
    }
  }

  // 5. Database Connection Pool Test
  async testConnectionPooling() {
    this.log("🏊 Testing Database Connection Pooling...", "info")

    try {
      // Simulate concurrent database operations
      const concurrentOperations = Array.from({ length: 10 }, (_, i) =>
        this.measureExecutionTime(async () => {
          return await this.supabase.from("system_settings").select("*").limit(1)
        }),
      )

      const { result: poolResults, executionTime: poolTime } = await this.measureExecutionTime(async () => {
        return await Promise.all(concurrentOperations)
      })

      const successfulOperations = poolResults.filter((op) => !op.result.error).length
      const averageTime = poolResults.reduce((sum, op) => sum + op.executionTime, 0) / poolResults.length

      if (successfulOperations === 10) {
        const status = averageTime < 500 ? "PASS" : "WARNING"
        this.addResult(
          "CONNECTION-POOL",
          status,
          `All 10 concurrent operations successful, avg: ${averageTime.toFixed(2)}ms`,
          poolTime,
        )
      } else {
        this.addResult("CONNECTION-POOL", "FAIL", `Only ${successfulOperations}/10 operations successful`, poolTime)
      }
    } catch (error: any) {
      this.addResult("CONNECTION-POOL", "FAIL", `Connection pooling test failed: ${error.message}`, 0, error)
    }
  }

  // 6. Transaction Test
  async testTransactionSupport() {
    this.log("💳 Testing Transaction Support...", "info")

    try {
      // Test transaction-like behavior with multiple related operations
      const testOrderData = {
        user_id: "00000000-0000-0000-0000-000000000001", // Assuming this exists
        total_amount: 150.0,
        status: "pending",
        payment_status: "pending",
        shipping_address: { street: "Test St", city: "Test City" },
        billing_address: { street: "Test St", city: "Test City" },
      }

      const { result: transactionResult, executionTime: transactionTime } = await this.measureExecutionTime(
        async () => {
          // This simulates a transaction by doing multiple related operations
          const orderResult = await this.supabase.from("orders").insert(testOrderData).select().single()

          if (orderResult.error) {
            throw new Error(`Order creation failed: ${orderResult.error.message}`)
          }

          const orderItemResult = await this.supabase.from("order_items").insert({
            order_id: orderResult.data.id,
            product_id: "00000000-0000-0000-0000-000000000001", // Assuming this exists
            quantity: 2,
            price: 75.0,
          })

          if (orderItemResult.error) {
            // Cleanup order if order item fails
            await this.supabase.from("orders").delete().eq("id", orderResult.data.id)
            throw new Error(`Order item creation failed: ${orderItemResult.error.message}`)
          }

          // Cleanup test data
          await this.supabase.from("order_items").delete().eq("order_id", orderResult.data.id)
          await this.supabase.from("orders").delete().eq("id", orderResult.data.id)

          return { success: true }
        },
      )

      if (transactionResult.success) {
        this.addResult(
          "TRANSACTION-SUPPORT",
          "PASS",
          `Transaction-like operations successful in ${transactionTime}ms`,
          transactionTime,
        )
      } else {
        this.addResult("TRANSACTION-SUPPORT", "FAIL", "Transaction-like operations failed", transactionTime)
      }
    } catch (error: any) {
      this.addResult(
        "TRANSACTION-SUPPORT",
        "WARNING",
        `Transaction test completed with issues: ${error.message}`,
        0,
        error,
      )
    }
  }

  // 7. Full-text Search Test
  async testFullTextSearch() {
    this.log("🔍 Testing Full-text Search Capabilities...", "info")

    try {
      // Test product search
      const { result: searchResult, executionTime: searchTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("products").select("*").textSearch("name", "sofa").limit(5)
      })

      if (searchResult.error) {
        this.addResult(
          "FULLTEXT-SEARCH",
          "WARNING",
          `Full-text search not available: ${searchResult.error.message}`,
          searchTime,
        )
      } else {
        this.addResult(
          "FULLTEXT-SEARCH",
          "PASS",
          `Full-text search working, found ${searchResult.data?.length || 0} results in ${searchTime}ms`,
          searchTime,
        )
      }

      // Test case-insensitive search
      const { result: iSearchResult, executionTime: iSearchTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("products").select("*").ilike("name", "%cover%").limit(5)
      })

      if (iSearchResult.error) {
        this.addResult(
          "CASE-INSENSITIVE-SEARCH",
          "FAIL",
          `Case-insensitive search failed: ${iSearchResult.error.message}`,
          iSearchTime,
        )
      } else {
        this.addResult(
          "CASE-INSENSITIVE-SEARCH",
          "PASS",
          `Case-insensitive search working, found ${iSearchResult.data?.length || 0} results in ${iSearchTime}ms`,
          iSearchTime,
        )
      }
    } catch (error: any) {
      this.addResult("SEARCH-CAPABILITIES", "FAIL", `Search test failed: ${error.message}`, 0, error)
    }
  }

  // Generate comprehensive report
  generateReport() {
    this.log("\n📋 DATABASE & INTEGRATION TESTING REPORT", "info")
    this.log("=".repeat(70), "info")

    const summary = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "PASS").length,
      failed: this.results.filter((r) => r.status === "FAIL").length,
      warnings: this.results.filter((r) => r.status === "WARNING").length,
    }

    // Performance analysis
    const performanceResults = this.results.filter((r) => r.executionTime !== undefined)
    const avgExecutionTime =
      performanceResults.length > 0
        ? performanceResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / performanceResults.length
        : 0

    this.log(`\n📊 SUMMARY:`, "info")
    this.log(`✅ PASSED: ${summary.passed}`, "success")
    this.log(`⚠️  WARNINGS: ${summary.warnings}`, "warning")
    this.log(`❌ FAILED: ${summary.failed}`, "error")
    this.log(`📈 TOTAL TESTS: ${summary.total}`, "info")
    this.log(`⚡ AVERAGE EXECUTION TIME: ${avgExecutionTime.toFixed(2)}ms`, "info")

    this.log(`\n📝 DETAILED RESULTS:`, "info")
    this.log("-".repeat(70), "info")

    // Group results by test category
    const categories = {
      "CRUD Operations": this.results.filter((r) => r.test.startsWith("CRUD")),
      "Query Performance": this.results.filter((r) => r.test.includes("QUERY") || r.test.includes("COMPLEX")),
      "Data Integrity": this.results.filter(
        (r) =>
          r.test.includes("INTEGRITY") ||
          r.test.includes("CONSTRAINTS") ||
          r.test.includes("REQUIRED") ||
          r.test.includes("UNIQUE"),
      ),
      "Redis Integration": this.results.filter((r) => r.test.includes("REDIS")),
      "Connection & Performance": this.results.filter(
        (r) => r.test.includes("CONNECTION") || r.test.includes("TRANSACTION"),
      ),
      "Search Capabilities": this.results.filter((r) => r.test.includes("SEARCH")),
      Other: this.results.filter(
        (r) =>
          !r.test.includes("CRUD") &&
          !r.test.includes("QUERY") &&
          !r.test.includes("COMPLEX") &&
          !r.test.includes("INTEGRITY") &&
          !r.test.includes("CONSTRAINTS") &&
          !r.test.includes("REQUIRED") &&
          !r.test.includes("UNIQUE") &&
          !r.test.includes("REDIS") &&
          !r.test.includes("CONNECTION") &&
          !r.test.includes("TRANSACTION") &&
          !r.test.includes("SEARCH"),
      ),
    }

    for (const [category, results] of Object.entries(categories)) {
      if (results.length === 0) continue

      this.log(`\n🔧 ${category.toUpperCase()}:`, "info")

      for (const result of results) {
        const icon = result.status === "PASS" ? "✅" : result.status === "WARNING" ? "⚠️" : "❌"
        const type = result.status === "PASS" ? "success" : result.status === "WARNING" ? "warning" : "error"
        const timeInfo = result.executionTime ? ` (${result.executionTime}ms)` : ""
        this.log(`  ${icon} ${result.test}: ${result.message}${timeInfo}`, type)
      }
    }

    // Performance recommendations
    const slowQueries = this.results.filter((r) => r.executionTime && r.executionTime > 2000)
    if (slowQueries.length > 0) {
      this.log(`\n🐌 SLOW OPERATIONS (>2000ms):`, "warning")
      slowQueries.forEach((query) => {
        this.log(`  ⚠️ ${query.test}: ${query.executionTime}ms`, "warning")
      })
    }

    // Critical issues
    const criticalIssues = this.results.filter((r) => r.status === "FAIL")
    if (criticalIssues.length > 0) {
      this.log(`\n🚨 CRITICAL DATABASE ISSUES:`, "error")
      this.log("=".repeat(70), "error")

      criticalIssues.forEach((issue, index) => {
        this.log(`${index + 1}. [${issue.test}] ${issue.message}`, "error")
      })
    }

    this.log(`\n💡 RECOMMENDATIONS:`, "info")
    this.log("-".repeat(70), "info")

    if (summary.failed === 0 && summary.warnings <= 2) {
      this.log("🎉 Excellent! Database and integrations are production-ready.", "success")
    } else {
      if (summary.failed > 0) {
        this.log("🔴 Fix all FAILED tests before production deployment.", "error")
      }
      if (summary.warnings > 3) {
        this.log("🟡 Consider addressing WARNING items for optimal performance.", "warning")
      }
      if (avgExecutionTime > 1000) {
        this.log("⚡ Consider database optimization for better performance.", "warning")
      }
    }

    this.log(`\n⏰ Testing completed at: ${new Date().toLocaleString("th-TH")}`, "info")
    this.log("=".repeat(70), "info")

    return {
      summary,
      results: this.results,
      criticalIssues,
      performanceMetrics: {
        averageExecutionTime: avgExecutionTime,
        slowOperations: slowQueries.length,
        totalOperations: performanceResults.length,
      },
      isDatabaseReady: summary.failed === 0,
    }
  }

  // Main execution method
  async runFullDatabaseTesting() {
    this.log("🚀 Starting Database & Integration Testing...", "info")
    this.log(`📅 Started at: ${new Date().toLocaleString("th-TH")}`, "info")
    this.log("=".repeat(70), "info")

    try {
      await this.testBasicCRUDOperations()
      await this.testComplexQueryPerformance()
      await this.testDataIntegrityConstraints()
      await this.testRedisIntegration()
      await this.testConnectionPooling()
      await this.testTransactionSupport()
      await this.testFullTextSearch()

      return this.generateReport()
    } catch (error: any) {
      this.log(`❌ Database testing failed: ${error.message}`, "error")
      this.addResult("SYSTEM", "FAIL", `Database testing execution failed: ${error.message}`, 0, error)
      return this.generateReport()
    }
  }
}

// Execute the database testing
async function main() {
  const tester = new DatabaseIntegrationTester()
  const report = await tester.runFullDatabaseTesting()

  // Save report to file
  const fs = await import("fs")
  const reportPath = `./database-testing-report-${Date.now()}.json`

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Database testing report saved to: ${reportPath}`)
  } catch (error) {
    console.log(`⚠️ Could not save report file: ${error}`)
  }

  // Exit with appropriate code
  process.exit(report.isDatabaseReady ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}

export { DatabaseIntegrationTester }
