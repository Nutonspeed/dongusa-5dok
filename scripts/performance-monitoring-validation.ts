#!/usr/bin/env tsx

/**
 * Performance & Monitoring Validation Suite
 * ทดสอบประสิทธิภาพและระบบการตรวจสอบของแอปพลิเคชัน
 */

import { createClient } from "@supabase/supabase-js"

interface PerformanceTestResult {
  category: string
  test: string
  status: "PASS" | "FAIL" | "WARNING" | "SKIP"
  message: string
  metrics?: {
    responseTime?: number
    throughput?: number
    memoryUsage?: number
    cpuUsage?: number
    errorRate?: number
    [key: string]: any
  }
  benchmark?: {
    target: number
    actual: number
    unit: string
  }
  timestamp: string
}

class PerformanceMonitoringValidator {
  private results: PerformanceTestResult[] = []
  private supabase: any
  private testStartTime: number = Date.now()

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    }
  }

  private addResult(
    category: string,
    test: string,
    status: "PASS" | "FAIL" | "WARNING" | "SKIP",
    message: string,
    metrics?: any,
    benchmark?: { target: number; actual: number; unit: string },
  ) {
    this.results.push({
      category,
      test,
      status,
      message,
      metrics,
      benchmark,
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
    console.log(`${colors[type]}[PERF-TEST] ${message}${reset}`)
  }

  private async measurePerformance<T>(
    operation: () => Promise<T>,
    iterations = 1,
  ): Promise<{
    result: T
    avgResponseTime: number
    minResponseTime: number
    maxResponseTime: number
    throughput: number
    errorCount: number
  }> {
    const startTime = Date.now()
    const responseTimes: number[] = []
    let errorCount = 0
    let lastResult: T

    for (let i = 0; i < iterations; i++) {
      const iterationStart = Date.now()
      try {
        lastResult = await operation()
        const iterationTime = Date.now() - iterationStart
        responseTimes.push(iterationTime)
      } catch (error) {
        errorCount++
        responseTimes.push(Date.now() - iterationStart)
      }
    }

    const totalTime = Date.now() - startTime
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const minResponseTime = Math.min(...responseTimes)
    const maxResponseTime = Math.max(...responseTimes)
    const throughput = (iterations / totalTime) * 1000 // requests per second

    return {
      result: lastResult!,
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      throughput,
      errorCount,
    }
  }

  // 1. Database Performance Testing
  async testDatabasePerformance() {
    this.log("🗄️ Testing Database Performance...", "info")

    try {
      // Test simple query performance
      const simpleQueryPerf = await this.measurePerformance(async () => {
        return await this.supabase.from("products").select("id, name, price").limit(10)
      }, 10)

      const simpleQueryBenchmark = { target: 200, actual: simpleQueryPerf.avgResponseTime, unit: "ms" }
      const simpleQueryStatus =
        simpleQueryPerf.avgResponseTime <= 200 ? "PASS" : simpleQueryPerf.avgResponseTime <= 500 ? "WARNING" : "FAIL"

      this.addResult(
        "Database Performance",
        "Simple Query Performance",
        simpleQueryStatus,
        `Average response time: ${simpleQueryPerf.avgResponseTime.toFixed(2)}ms`,
        {
          responseTime: simpleQueryPerf.avgResponseTime,
          throughput: simpleQueryPerf.throughput,
          errorRate: (simpleQueryPerf.errorCount / 10) * 100,
        },
        simpleQueryBenchmark,
      )

      // Test complex query performance
      const complexQueryPerf = await this.measurePerformance(async () => {
        return await this.supabase
          .from("orders")
          .select(`
              *,
              order_items(*, products(name, price)),
              profiles(full_name, email)
            `)
          .limit(5)
      }, 5)

      const complexQueryBenchmark = { target: 1000, actual: complexQueryPerf.avgResponseTime, unit: "ms" }
      const complexQueryStatus =
        complexQueryPerf.avgResponseTime <= 1000
          ? "PASS"
          : complexQueryPerf.avgResponseTime <= 2000
            ? "WARNING"
            : "FAIL"

      this.addResult(
        "Database Performance",
        "Complex Query Performance",
        complexQueryStatus,
        `Average response time: ${complexQueryPerf.avgResponseTime.toFixed(2)}ms`,
        {
          responseTime: complexQueryPerf.avgResponseTime,
          throughput: complexQueryPerf.throughput,
          errorRate: (complexQueryPerf.errorCount / 5) * 100,
        },
        complexQueryBenchmark,
      )

      // Test concurrent database operations
      const concurrentOps = Array.from({ length: 20 }, () => this.supabase.from("system_settings").select("*").limit(1))

      const concurrentStart = Date.now()
      const concurrentResults = await Promise.allSettled(concurrentOps)
      const concurrentTime = Date.now() - concurrentStart

      const successfulOps = concurrentResults.filter((r) => r.status === "fulfilled").length
      const concurrentThroughput = (successfulOps / concurrentTime) * 1000

      const concurrentBenchmark = { target: 10, actual: concurrentThroughput, unit: "ops/sec" }
      const concurrentStatus = concurrentThroughput >= 10 ? "PASS" : concurrentThroughput >= 5 ? "WARNING" : "FAIL"

      this.addResult(
        "Database Performance",
        "Concurrent Operations",
        concurrentStatus,
        `${successfulOps}/20 operations successful, throughput: ${concurrentThroughput.toFixed(2)} ops/sec`,
        {
          throughput: concurrentThroughput,
          successRate: (successfulOps / 20) * 100,
          responseTime: concurrentTime,
        },
        concurrentBenchmark,
      )

      // Test large dataset query performance
      const largeDatasetPerf = await this.measurePerformance(async () => {
        return await this.supabase.from("unified_messages").select("*").limit(100)
      }, 3)

      const largeDatasetBenchmark = { target: 1500, actual: largeDatasetPerf.avgResponseTime, unit: "ms" }
      const largeDatasetStatus =
        largeDatasetPerf.avgResponseTime <= 1500
          ? "PASS"
          : largeDatasetPerf.avgResponseTime <= 3000
            ? "WARNING"
            : "FAIL"

      this.addResult(
        "Database Performance",
        "Large Dataset Query",
        largeDatasetStatus,
        `Average response time: ${largeDatasetPerf.avgResponseTime.toFixed(2)}ms for 100 records`,
        {
          responseTime: largeDatasetPerf.avgResponseTime,
          throughput: largeDatasetPerf.throughput,
        },
        largeDatasetBenchmark,
      )
    } catch (error: any) {
      this.addResult(
        "Database Performance",
        "Performance Testing",
        "FAIL",
        `Database performance test failed: ${error.message}`,
      )
    }
  }

  // 2. API Endpoint Performance Testing
  async testAPIEndpointPerformance() {
    this.log("🔌 Testing API Endpoint Performance...", "info")

    try {
      // Test notification API endpoint
      const notificationAPIPerf = await this.measurePerformance(async () => {
        const response = await fetch("/api/notifications/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: true, skipSend: true }),
        })
        return response
      }, 5)

      const notificationBenchmark = { target: 500, actual: notificationAPIPerf.avgResponseTime, unit: "ms" }
      const notificationStatus =
        notificationAPIPerf.avgResponseTime <= 500
          ? "PASS"
          : notificationAPIPerf.avgResponseTime <= 1000
            ? "WARNING"
            : "FAIL"

      this.addResult(
        "API Performance",
        "Notification API",
        notificationStatus,
        `Average response time: ${notificationAPIPerf.avgResponseTime.toFixed(2)}ms`,
        {
          responseTime: notificationAPIPerf.avgResponseTime,
          throughput: notificationAPIPerf.throughput,
          errorRate: (notificationAPIPerf.errorCount / 5) * 100,
        },
        notificationBenchmark,
      )

      // Test health check endpoint performance
      const healthCheckPerf = await this.measurePerformance(async () => {
        const response = await fetch("/api/health", { method: "GET" })
        return response
      }, 10)

      const healthBenchmark = { target: 100, actual: healthCheckPerf.avgResponseTime, unit: "ms" }
      const healthStatus =
        healthCheckPerf.avgResponseTime <= 100 ? "PASS" : healthCheckPerf.avgResponseTime <= 300 ? "WARNING" : "FAIL"

      this.addResult(
        "API Performance",
        "Health Check API",
        healthStatus,
        `Average response time: ${healthCheckPerf.avgResponseTime.toFixed(2)}ms`,
        {
          responseTime: healthCheckPerf.avgResponseTime,
          throughput: healthCheckPerf.throughput,
          errorRate: (healthCheckPerf.errorCount / 10) * 100,
        },
        healthBenchmark,
      )
    } catch (error: any) {
      this.addResult(
        "API Performance",
        "Endpoint Testing",
        "WARNING",
        `API endpoint testing completed with issues: ${error.message}`,
      )
    }
  }

  // 3. Memory and Resource Usage Testing
  async testResourceUsage() {
    this.log("💾 Testing Memory and Resource Usage...", "info")

    try {
      const initialMemory = process.memoryUsage()

      // Simulate memory-intensive operations
      const memoryTestData = []
      for (let i = 0; i < 10000; i++) {
        memoryTestData.push({
          id: i,
          data: `Test data item ${i}`.repeat(10),
          timestamp: new Date().toISOString(),
        })
      }

      // Perform database operations while monitoring memory
      const memoryTestStart = Date.now()
      await this.supabase.from("system_settings").select("*").limit(50)

      const finalMemory = process.memoryUsage()
      const memoryTestTime = Date.now() - memoryTestStart

      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      const memoryIncreaseKB = memoryIncrease / 1024

      const memoryBenchmark = { target: 50000, actual: memoryIncreaseKB, unit: "KB" }
      const memoryStatus = memoryIncreaseKB <= 50000 ? "PASS" : memoryIncreaseKB <= 100000 ? "WARNING" : "FAIL"

      this.addResult(
        "Resource Usage",
        "Memory Usage",
        memoryStatus,
        `Memory increase: ${memoryIncreaseKB.toFixed(2)} KB during test operations`,
        {
          memoryUsage: memoryIncreaseKB,
          heapUsed: finalMemory.heapUsed / 1024 / 1024, // MB
          heapTotal: finalMemory.heapTotal / 1024 / 1024, // MB
          external: finalMemory.external / 1024 / 1024, // MB
        },
        memoryBenchmark,
      )

      // Test garbage collection efficiency
      if (global.gc) {
        const beforeGC = process.memoryUsage()
        global.gc()
        const afterGC = process.memoryUsage()

        const gcEfficiency = ((beforeGC.heapUsed - afterGC.heapUsed) / beforeGC.heapUsed) * 100

        const gcBenchmark = { target: 10, actual: gcEfficiency, unit: "%" }
        const gcStatus = gcEfficiency >= 10 ? "PASS" : gcEfficiency >= 5 ? "WARNING" : "FAIL"

        this.addResult(
          "Resource Usage",
          "Garbage Collection",
          gcStatus,
          `GC freed ${gcEfficiency.toFixed(2)}% of heap memory`,
          {
            gcEfficiency,
            beforeGC: beforeGC.heapUsed / 1024 / 1024,
            afterGC: afterGC.heapUsed / 1024 / 1024,
          },
          gcBenchmark,
        )
      } else {
        this.addResult(
          "Resource Usage",
          "Garbage Collection",
          "SKIP",
          "GC testing not available (--expose-gc flag not set)",
        )
      }

      // Clean up test data
      memoryTestData.length = 0
    } catch (error: any) {
      this.addResult("Resource Usage", "Usage Testing", "FAIL", `Resource usage test failed: ${error.message}`)
    }
  }

  // 4. Load Testing Simulation
  async testLoadHandling() {
    this.log("⚡ Testing Load Handling Capabilities...", "info")

    try {
      // Simulate concurrent user sessions
      const concurrentUsers = 50
      const operationsPerUser = 5

      const userOperations = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
        const operations = []
        for (let i = 0; i < operationsPerUser; i++) {
          operations.push(
            this.supabase
              .from("products")
              .select("id, name, price")
              .limit(5)
              .then(() => ({ success: true, user: userIndex, operation: i }))
              .catch(() => ({ success: false, user: userIndex, operation: i })),
          )
        }
        return Promise.all(operations)
      })

      const loadTestStart = Date.now()
      const loadTestResults = await Promise.all(userOperations)
      const loadTestTime = Date.now() - loadTestStart

      const totalOperations = concurrentUsers * operationsPerUser
      const successfulOperations = loadTestResults.flat().filter((result) => result.success).length

      const successRate = (successfulOperations / totalOperations) * 100
      const throughput = (totalOperations / loadTestTime) * 1000

      const loadBenchmark = { target: 80, actual: successRate, unit: "%" }
      const loadStatus = successRate >= 80 ? "PASS" : successRate >= 60 ? "WARNING" : "FAIL"

      this.addResult(
        "Load Testing",
        "Concurrent User Simulation",
        loadStatus,
        `${successfulOperations}/${totalOperations} operations successful (${successRate.toFixed(2)}%)`,
        {
          successRate,
          throughput,
          responseTime: loadTestTime,
          concurrentUsers,
          operationsPerUser,
        },
        loadBenchmark,
      )

      // Test database connection pool under load
      const connectionPoolTest = Array.from({ length: 100 }, () =>
        this.supabase.from("system_settings").select("key").limit(1),
      )

      const poolTestStart = Date.now()
      const poolResults = await Promise.allSettled(connectionPoolTest)
      const poolTestTime = Date.now() - poolTestStart

      const poolSuccessful = poolResults.filter((r) => r.status === "fulfilled").length
      const poolSuccessRate = (poolSuccessful / 100) * 100

      const poolBenchmark = { target: 95, actual: poolSuccessRate, unit: "%" }
      const poolStatus = poolSuccessRate >= 95 ? "PASS" : poolSuccessRate >= 85 ? "WARNING" : "FAIL"

      this.addResult(
        "Load Testing",
        "Connection Pool Stress",
        poolStatus,
        `${poolSuccessful}/100 connections successful (${poolSuccessRate.toFixed(2)}%)`,
        {
          successRate: poolSuccessRate,
          responseTime: poolTestTime,
          throughput: (100 / poolTestTime) * 1000,
        },
        poolBenchmark,
      )
    } catch (error: any) {
      this.addResult("Load Testing", "Load Handling", "FAIL", `Load testing failed: ${error.message}`)
    }
  }

  // 5. Monitoring System Validation
  async testMonitoringSystem() {
    this.log("📊 Testing Monitoring System...", "info")

    try {
      // Test error logging system
      const { data: bugReports, error: bugError } = await this.supabase
        .from("bug_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (bugError) {
        this.addResult("Monitoring", "Error Logging", "FAIL", `Error logging system failed: ${bugError.message}`)
      } else {
        this.addResult(
          "Monitoring",
          "Error Logging",
          "PASS",
          `Error logging system working - ${bugReports?.length || 0} recent reports`,
          {
            recentReports: bugReports?.length || 0,
          },
        )
      }

      // Test user feedback system
      const { data: feedback, error: feedbackError } = await this.supabase
        .from("user_feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (feedbackError) {
        this.addResult("Monitoring", "User Feedback", "FAIL", `User feedback system failed: ${feedbackError.message}`)
      } else {
        this.addResult(
          "Monitoring",
          "User Feedback",
          "PASS",
          `User feedback system working - ${feedback?.length || 0} recent feedback`,
          {
            recentFeedback: feedback?.length || 0,
          },
        )
      }

      // Test AI chat performance monitoring
      const { data: aiPerformance, error: aiError } = await this.supabase
        .from("ai_chat_performance")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (aiError) {
        this.addResult(
          "Monitoring",
          "AI Performance Tracking",
          "WARNING",
          `AI performance tracking issue: ${aiError.message}`,
        )
      } else {
        const avgResponseTime =
          aiPerformance?.length > 0
            ? aiPerformance.reduce((sum, p) => sum + (p.response_time_seconds || 0), 0) / aiPerformance.length
            : 0

        this.addResult(
          "Monitoring",
          "AI Performance Tracking",
          "PASS",
          `AI performance tracking working - avg response: ${avgResponseTime.toFixed(2)}s`,
          {
            recentPerformanceRecords: aiPerformance?.length || 0,
            avgResponseTime,
          },
        )
      }

      // Test notification system monitoring
      const { data: notifications, error: notifError } = await this.supabase
        .from("notifications")
        .select("status")
        .order("created_at", { ascending: false })
        .limit(100)

      if (notifError) {
        this.addResult(
          "Monitoring",
          "Notification Monitoring",
          "FAIL",
          `Notification monitoring failed: ${notifError.message}`,
        )
      } else {
        const statusCounts =
          notifications?.reduce(
            (acc, n) => {
              acc[n.status] = (acc[n.status] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ) || {}

        const successRate = notifications?.length > 0 ? ((statusCounts.sent || 0) / notifications.length) * 100 : 0

        const monitoringBenchmark = { target: 85, actual: successRate, unit: "%" }
        const monitoringStatus = successRate >= 85 ? "PASS" : successRate >= 70 ? "WARNING" : "FAIL"

        this.addResult(
          "Monitoring",
          "Notification Monitoring",
          monitoringStatus,
          `Notification success rate: ${successRate.toFixed(2)}%`,
          {
            successRate,
            statusCounts,
            totalNotifications: notifications?.length || 0,
          },
          monitoringBenchmark,
        )
      }
    } catch (error: any) {
      this.addResult("Monitoring", "System Validation", "FAIL", `Monitoring system test failed: ${error.message}`)
    }
  }

  // 6. System Health Checks
  async testSystemHealth() {
    this.log("🏥 Testing System Health Checks...", "info")

    try {
      // Test database connectivity health
      const dbHealthStart = Date.now()
      const { data: healthCheck, error: healthError } = await this.supabase
        .from("system_settings")
        .select("count")
        .limit(1)

      const dbHealthTime = Date.now() - dbHealthStart

      if (healthError) {
        this.addResult(
          "System Health",
          "Database Health",
          "FAIL",
          `Database health check failed: ${healthError.message}`,
          { responseTime: dbHealthTime },
        )
      } else {
        const healthBenchmark = { target: 200, actual: dbHealthTime, unit: "ms" }
        const healthStatus = dbHealthTime <= 200 ? "PASS" : dbHealthTime <= 500 ? "WARNING" : "FAIL"

        this.addResult(
          "System Health",
          "Database Health",
          healthStatus,
          `Database health check passed in ${dbHealthTime}ms`,
          { responseTime: dbHealthTime },
          healthBenchmark,
        )
      }

      // Test Redis health (if available)
      const redisUrl = process.env.KV_REST_API_URL
      const redisToken = process.env.KV_REST_API_TOKEN

      if (redisUrl && redisToken) {
        const redisHealthStart = Date.now()
        try {
          const response = await fetch(`${redisUrl}/ping`, {
            headers: { Authorization: `Bearer ${redisToken}` },
          })
          const redisHealthTime = Date.now() - redisHealthStart

          const redisBenchmark = { target: 100, actual: redisHealthTime, unit: "ms" }
          const redisStatus =
            response.ok && redisHealthTime <= 100 ? "PASS" : redisHealthTime <= 300 ? "WARNING" : "FAIL"

          this.addResult(
            "System Health",
            "Redis Health",
            redisStatus,
            `Redis health check ${response.ok ? "passed" : "failed"} in ${redisHealthTime}ms`,
            { responseTime: redisHealthTime, status: response.status },
            redisBenchmark,
          )
        } catch (error: any) {
          this.addResult("System Health", "Redis Health", "FAIL", `Redis health check failed: ${error.message}`)
        }
      } else {
        this.addResult("System Health", "Redis Health", "SKIP", "Redis configuration not available for health check")
      }

      // Test overall system responsiveness
      const systemTests = [
        () => this.supabase.from("products").select("count").limit(1),
        () => this.supabase.from("orders").select("count").limit(1),
        () => this.supabase.from("profiles").select("count").limit(1),
      ]

      const systemHealthStart = Date.now()
      const systemResults = await Promise.allSettled(systemTests.map((test) => test()))
      const systemHealthTime = Date.now() - systemHealthStart

      const systemSuccessful = systemResults.filter((r) => r.status === "fulfilled").length
      const systemSuccessRate = (systemSuccessful / systemTests.length) * 100

      const systemBenchmark = { target: 100, actual: systemSuccessRate, unit: "%" }
      const systemStatus = systemSuccessRate === 100 ? "PASS" : systemSuccessRate >= 80 ? "WARNING" : "FAIL"

      this.addResult(
        "System Health",
        "Overall System Health",
        systemStatus,
        `${systemSuccessful}/${systemTests.length} system components healthy`,
        {
          successRate: systemSuccessRate,
          responseTime: systemHealthTime,
          componentCount: systemTests.length,
        },
        systemBenchmark,
      )
    } catch (error: any) {
      this.addResult("System Health", "Health Checks", "FAIL", `System health test failed: ${error.message}`)
    }
  }

  // Generate comprehensive performance report
  generatePerformanceReport() {
    this.log("\n📋 PERFORMANCE & MONITORING VALIDATION REPORT", "info")
    this.log("=".repeat(100), "info")

    const summary = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "PASS").length,
      failed: this.results.filter((r) => r.status === "FAIL").length,
      warnings: this.results.filter((r) => r.status === "WARNING").length,
      skipped: this.results.filter((r) => r.status === "SKIP").length,
    }

    // Performance metrics analysis
    const performanceMetrics = {
      avgDatabaseResponseTime: 0,
      avgAPIResponseTime: 0,
      systemThroughput: 0,
      memoryEfficiency: 0,
      overallHealthScore: 0,
    }

    const dbPerformanceResults = this.results.filter(
      (r) => r.category === "Database Performance" && r.metrics?.responseTime,
    )
    if (dbPerformanceResults.length > 0) {
      performanceMetrics.avgDatabaseResponseTime =
        dbPerformanceResults.reduce((sum, r) => sum + (r.metrics?.responseTime || 0), 0) / dbPerformanceResults.length
    }

    const apiPerformanceResults = this.results.filter(
      (r) => r.category === "API Performance" && r.metrics?.responseTime,
    )
    if (apiPerformanceResults.length > 0) {
      performanceMetrics.avgAPIResponseTime =
        apiPerformanceResults.reduce((sum, r) => sum + (r.metrics?.responseTime || 0), 0) / apiPerformanceResults.length
    }

    const throughputResults = this.results.filter((r) => r.metrics?.throughput)
    if (throughputResults.length > 0) {
      performanceMetrics.systemThroughput =
        throughputResults.reduce((sum, r) => sum + (r.metrics?.throughput || 0), 0) / throughputResults.length
    }

    // Calculate overall performance score
    const maxScore = this.results.length * 100
    const actualScore = this.results.reduce((score, result) => {
      if (result.status === "PASS") return score + 100
      if (result.status === "WARNING") return score + 60
      if (result.status === "SKIP") return score + 30
      return score // FAIL = 0 points
    }, 0)

    const performanceScore = Math.round((actualScore / maxScore) * 100)

    this.log(`\n📊 SUMMARY:`, "info")
    this.log(`✅ PASSED: ${summary.passed}`, "success")
    this.log(`⚠️  WARNINGS: ${summary.warnings}`, "warning")
    this.log(`❌ FAILED: ${summary.failed}`, "error")
    this.log(`⏭️  SKIPPED: ${summary.skipped}`, "info")
    this.log(`📈 TOTAL TESTS: ${summary.total}`, "info")

    this.log(`\n⚡ PERFORMANCE METRICS:`, "info")
    this.log(`🗄️  Average Database Response Time: ${performanceMetrics.avgDatabaseResponseTime.toFixed(2)}ms`, "info")
    this.log(`🔌 Average API Response Time: ${performanceMetrics.avgAPIResponseTime.toFixed(2)}ms`, "info")
    this.log(`📊 System Throughput: ${performanceMetrics.systemThroughput.toFixed(2)} ops/sec`, "info")
    this.log(
      `🎯 Performance Score: ${performanceScore}%`,
      performanceScore >= 80 ? "success" : performanceScore >= 60 ? "warning" : "error",
    )

    this.log(`\n📝 DETAILED RESULTS BY CATEGORY:`, "info")
    this.log("-".repeat(100), "info")

    // Group results by category
    const categoryGroups = this.results.reduce(
      (acc, result) => {
        if (!acc[result.category]) {
          acc[result.category] = []
        }
        acc[result.category].push(result)
        return acc
      },
      {} as Record<string, PerformanceTestResult[]>,
    )

    for (const [category, results] of Object.entries(categoryGroups)) {
      this.log(`\n🔧 ${category.toUpperCase()}:`, "info")

      const categorySummary = {
        passed: results.filter((r) => r.status === "PASS").length,
        failed: results.filter((r) => r.status === "FAIL").length,
        warnings: results.filter((r) => r.status === "WARNING").length,
        skipped: results.filter((r) => r.status === "SKIP").length,
      }

      this.log(
        `   Status: ${categorySummary.passed}✅ ${categorySummary.failed}❌ ${categorySummary.warnings}⚠️ ${categorySummary.skipped}⏭️`,
        "info",
      )

      for (const result of results) {
        const statusIcon =
          result.status === "PASS" ? "✅" : result.status === "WARNING" ? "⚠️" : result.status === "SKIP" ? "⏭️" : "❌"
        const type =
          result.status === "PASS"
            ? "success"
            : result.status === "WARNING"
              ? "warning"
              : result.status === "SKIP"
                ? "info"
                : "error"

        let benchmarkInfo = ""
        if (result.benchmark) {
          const benchmarkStatus = result.benchmark.actual <= result.benchmark.target ? "✅" : "❌"
          benchmarkInfo = ` [Target: ${result.benchmark.target}${result.benchmark.unit}, Actual: ${result.benchmark.actual.toFixed(2)}${result.benchmark.unit} ${benchmarkStatus}]`
        }

        this.log(`   ${statusIcon} ${result.test}: ${result.message}${benchmarkInfo}`, type)

        // Show key metrics if available
        if (result.metrics) {
          const metricsInfo = []
          if (result.metrics.responseTime) metricsInfo.push(`Response: ${result.metrics.responseTime.toFixed(2)}ms`)
          if (result.metrics.throughput) metricsInfo.push(`Throughput: ${result.metrics.throughput.toFixed(2)} ops/sec`)
          if (result.metrics.successRate) metricsInfo.push(`Success: ${result.metrics.successRate.toFixed(1)}%`)
          if (result.metrics.memoryUsage) metricsInfo.push(`Memory: ${result.metrics.memoryUsage.toFixed(2)} KB`)

          if (metricsInfo.length > 0) {
            this.log(`      Metrics: ${metricsInfo.join(", ")}`, "info")
          }
        }
      }
    }

    // Performance bottlenecks identification
    const bottlenecks = this.results.filter(
      (r) => (r.benchmark && r.benchmark.actual > r.benchmark.target) || r.status === "FAIL",
    )

    if (bottlenecks.length > 0) {
      this.log(`\n🐌 PERFORMANCE BOTTLENECKS IDENTIFIED:`, "warning")
      this.log("-".repeat(100), "warning")

      bottlenecks.forEach((bottleneck, index) => {
        this.log(`${index + 1}. [${bottleneck.category}] ${bottleneck.test}:`, "warning")
        this.log(`   ${bottleneck.message}`, "warning")
        if (bottleneck.benchmark) {
          this.log(
            `   Target: ${bottleneck.benchmark.target}${bottleneck.benchmark.unit}, Actual: ${bottleneck.benchmark.actual.toFixed(2)}${bottleneck.benchmark.unit}`,
            "warning",
          )
        }
        this.log("", "info")
      })
    }

    // Production readiness assessment
    const criticalFailures = this.results.filter(
      (r) => r.status === "FAIL" && (r.category === "System Health" || r.category === "Database Performance"),
    )

    this.log(`\n🎯 PRODUCTION READINESS ASSESSMENT:`, "info")
    this.log("-".repeat(100), "info")

    if (criticalFailures.length === 0 && performanceScore >= 70) {
      this.log("🎉 System performance meets production requirements!", "success")
      this.log("✅ Ready for production deployment with current load expectations.", "success")
    } else {
      if (criticalFailures.length > 0) {
        this.log("🚨 Critical performance issues must be resolved before production:", "error")
        criticalFailures.forEach((failure) => {
          this.log(`   • ${failure.test}: ${failure.message}`, "error")
        })
      }
      if (performanceScore < 70) {
        this.log("⚠️ Performance score below recommended threshold for production.", "warning")
      }
    }

    // Recommendations
    this.log(`\n💡 PERFORMANCE RECOMMENDATIONS:`, "info")
    this.log("-".repeat(100), "info")

    if (performanceMetrics.avgDatabaseResponseTime > 500) {
      this.log("🗄️ Consider database query optimization and indexing.", "warning")
    }
    if (performanceMetrics.avgAPIResponseTime > 1000) {
      this.log("🔌 Consider API endpoint optimization and caching.", "warning")
    }
    if (performanceMetrics.systemThroughput < 10) {
      this.log("📊 Consider scaling infrastructure for better throughput.", "warning")
    }
    if (summary.warnings > 5) {
      this.log("⚠️ Address performance warnings to optimize user experience.", "warning")
    }

    const totalTestTime = Date.now() - this.testStartTime
    this.log(`\n⏰ Performance testing completed in ${(totalTestTime / 1000).toFixed(2)} seconds`, "info")
    this.log(`📅 Completed at: ${new Date().toLocaleString("th-TH")}`, "info")
    this.log("=".repeat(100), "info")

    return {
      summary,
      performanceMetrics,
      results: this.results,
      bottlenecks,
      criticalFailures,
      performanceScore,
      isPerformant: performanceScore >= 70 && criticalFailures.length === 0,
      isProductionReady: performanceScore >= 80 && criticalFailures.length === 0 && summary.failed <= 2,
      testDuration: totalTestTime,
    }
  }

  // Main execution method
  async runFullPerformanceValidation() {
    this.log("🚀 Starting Performance & Monitoring Validation...", "info")
    this.log(`📅 Started at: ${new Date().toLocaleString("th-TH")}`, "info")
    this.log("=".repeat(100), "info")

    try {
      await this.testDatabasePerformance()
      await this.testAPIEndpointPerformance()
      await this.testResourceUsage()
      await this.testLoadHandling()
      await this.testMonitoringSystem()
      await this.testSystemHealth()

      return this.generatePerformanceReport()
    } catch (error: any) {
      this.log(`❌ Performance validation failed: ${error.message}`, "error")
      this.addResult("System", "Execution", "FAIL", `Performance validation execution failed: ${error.message}`)
      return this.generatePerformanceReport()
    }
  }
}

// Execute the performance validation
async function main() {
  const validator = new PerformanceMonitoringValidator()
  const report = await validator.runFullPerformanceValidation()

  // Save report to file
  const fs = await import("fs")
  const reportPath = `./performance-validation-report-${Date.now()}.json`

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Performance validation report saved to: ${reportPath}`)
  } catch (error) {
    console.log(`⚠️ Could not save report file: ${error}`)
  }

  // Exit with appropriate code
  process.exit(report.isProductionReady ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}

export { PerformanceMonitoringValidator }
