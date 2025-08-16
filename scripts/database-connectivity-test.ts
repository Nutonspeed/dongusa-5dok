#!/usr/bin/env tsx

/**
 * Database Connectivity Test Script
 * ทดสอบการเชื่อมต่อและการทำงานของ Database
 */

import { createClient } from "@supabase/supabase-js"

interface DatabaseTest {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  duration?: number
}

class DatabaseTester {
  private supabase: any
  private results: DatabaseTest[] = []
  private startTime = Date.now()

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      this.log("Missing Supabase credentials", "error")
      process.exit(1)
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  private log(message: string, type: "info" | "success" | "error" | "warning" = "info") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      reset: "\x1b[0m",
    }

    console.log(`${colors[type]}[DB-TEST] ${message}${colors.reset}`)
  }

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<DatabaseTest> {
    const testStart = Date.now()
    this.log(`Running: ${testName}...`)

    try {
      await testFn()
      const duration = Date.now() - testStart
      this.log(`✓ ${testName} passed (${duration}ms)`, "success")

      return {
        name: testName,
        status: "pass",
        message: `Test completed successfully in ${duration}ms`,
        duration,
      }
    } catch (error: any) {
      const duration = Date.now() - testStart
      this.log(`✗ ${testName} failed: ${error.message}`, "error")

      return {
        name: testName,
        status: "fail",
        message: error.message,
        duration,
      }
    }
  }

  private async testConnection(): Promise<void> {
    // Test basic connection
    const { data, error } = await this.supabase.from("profiles").select("count", { count: "exact", head: true })

    if (error) {
      throw new Error(`Connection failed: ${error.message}`)
    }

    this.log("Database connection established successfully", "success")
  }

  private async testTableAccess(): Promise<void> {
    // Test access to key tables
    const tables = ["profiles", "products", "categories", "orders", "cart_items"]

    for (const table of tables) {
      const { data, error } = await this.supabase.from(table).select("*").limit(1)

      if (error) {
        throw new Error(`Cannot access table '${table}': ${error.message}`)
      }

      this.log(`✓ Table '${table}' accessible`, "success")
    }
  }

  private async testCRUDOperations(): Promise<void> {
    // Test Create, Read, Update, Delete operations on a test table
    const testData = {
      key: `test_${Date.now()}`,
      value: { test: true, timestamp: new Date().toISOString() },
      description: "Database connectivity test",
    }

    // CREATE
    const { data: insertData, error: insertError } = await this.supabase
      .from("system_settings")
      .insert(testData)
      .select()

    if (insertError) {
      throw new Error(`CREATE failed: ${insertError.message}`)
    }

    const testId = insertData[0].id
    this.log("✓ CREATE operation successful", "success")

    // READ
    const { data: readData, error: readError } = await this.supabase
      .from("system_settings")
      .select("*")
      .eq("id", testId)
      .single()

    if (readError) {
      throw new Error(`READ failed: ${readError.message}`)
    }

    this.log("✓ READ operation successful", "success")

    // UPDATE
    const { error: updateError } = await this.supabase
      .from("system_settings")
      .update({ description: "Updated test description" })
      .eq("id", testId)

    if (updateError) {
      throw new Error(`UPDATE failed: ${updateError.message}`)
    }

    this.log("✓ UPDATE operation successful", "success")

    // DELETE
    const { error: deleteError } = await this.supabase.from("system_settings").delete().eq("id", testId)

    if (deleteError) {
      throw new Error(`DELETE failed: ${deleteError.message}`)
    }

    this.log("✓ DELETE operation successful", "success")
  }

  private async testDataIntegrity(): Promise<void> {
    // Test foreign key relationships and data integrity
    const { data: products, error: productsError } = await this.supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .limit(5)

    if (productsError) {
      throw new Error(`Data integrity test failed: ${productsError.message}`)
    }

    // Check if products have valid categories
    const productsWithoutCategories = products?.filter((p) => !p.categories) || []

    if (productsWithoutCategories.length > 0) {
      this.log(`Warning: ${productsWithoutCategories.length} products without categories`, "warning")
    }

    this.log("✓ Data integrity check completed", "success")
  }

  private async testPerformance(): Promise<void> {
    const performanceStart = Date.now()

    // Test query performance with a complex query
    const { data, error } = await this.supabase
      .from("orders")
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        order_items (
          *,
          products (
            name,
            price
          )
        )
      `)
      .limit(10)

    if (error) {
      throw new Error(`Performance test failed: ${error.message}`)
    }

    const queryTime = Date.now() - performanceStart

    if (queryTime > 5000) {
      this.log(`Warning: Complex query took ${queryTime}ms (>5s)`, "warning")
    } else {
      this.log(`✓ Complex query completed in ${queryTime}ms`, "success")
    }
  }

  private async testEnvironmentVariables(): Promise<void> {
    const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(", ")}`)
    }

    this.log("✓ All required environment variables present", "success")
  }

  private generateReport(): void {
    const totalTime = Date.now() - this.startTime
    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const warnings = this.results.filter((r) => r.status === "warning").length

    this.log("=".repeat(60), "info")
    this.log("DATABASE CONNECTIVITY REPORT", "info")
    this.log("=".repeat(60), "info")

    this.results.forEach((result) => {
      const icon = result.status === "pass" ? "✓" : result.status === "fail" ? "✗" : "⚠"
      const color = result.status === "pass" ? "success" : result.status === "fail" ? "error" : "warning"
      this.log(`${icon} ${result.name}: ${result.message}`, color)
    })

    this.log("=".repeat(60), "info")
    this.log(`Total Tests: ${this.results.length}`, "info")
    this.log(`Passed: ${passed}`, passed > 0 ? "success" : "info")
    this.log(`Failed: ${failed}`, failed > 0 ? "error" : "info")
    this.log(`Warnings: ${warnings}`, warnings > 0 ? "warning" : "info")
    this.log(`Total Time: ${totalTime}ms`, "info")

    if (failed === 0) {
      this.log("🎉 DATABASE TEST PASSED! All database operations working correctly.", "success")
    } else {
      this.log("❌ DATABASE TEST FAILED! Please check database configuration.", "error")
    }
  }

  async runAllTests(): Promise<boolean> {
    this.log("Starting database connectivity tests...", "info")
    this.log("=".repeat(60), "info")

    // Run all tests
    this.results.push(await this.runTest("Environment Variables Check", () => this.testEnvironmentVariables()))
    this.results.push(await this.runTest("Database Connection", () => this.testConnection()))
    this.results.push(await this.runTest("Table Access Test", () => this.testTableAccess()))
    this.results.push(await this.runTest("CRUD Operations Test", () => this.testCRUDOperations()))
    this.results.push(await this.runTest("Data Integrity Test", () => this.testDataIntegrity()))
    this.results.push(await this.runTest("Performance Test", () => this.testPerformance()))

    // Generate report
    this.generateReport()

    const hasFailures = this.results.some((r) => r.status === "fail")
    return !hasFailures
  }
}

// Run the test
const tester = new DatabaseTester()
tester
  .runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error("Database test failed with error:", error)
    process.exit(1)
  })
