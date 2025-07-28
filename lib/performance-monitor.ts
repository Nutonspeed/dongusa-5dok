import { enhancedMockDatabaseService } from "./enhanced-mock-database"
import { developmentConfig } from "./development-config"

// Performance metrics types
export interface PerformanceMetrics {
  timestamp: string
  operation: string
  duration: number
  memoryUsage: number
  cpuUsage?: number
  status: "success" | "error"
  details?: any
}

export interface SystemHealth {
  overall: "healthy" | "warning" | "critical"
  database: {
    status: "healthy" | "warning" | "critical"
    responseTime: number
    errorRate: number
    throughput: number
  }
  memory: {
    used: number
    available: number
    percentage: number
  }
  performance: {
    averageResponseTime: number
    slowestOperations: Array<{
      operation: string
      duration: number
      timestamp: string
    }>
    fastestOperations: Array<{
      operation: string
      duration: number
      timestamp: string
    }>
  }
  recommendations: string[]
}

export interface OptimizationReport {
  timestamp: string
  issues: Array<{
    severity: "low" | "medium" | "high" | "critical"
    category: "performance" | "memory" | "database" | "network"
    description: string
    recommendation: string
    impact: string
  }>
  optimizations: Array<{
    type: "cache" | "query" | "memory" | "network"
    description: string
    estimatedImprovement: string
    implementation: string
  }>
  score: number // 0-100
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 10000
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false

  constructor() {
    this.startMonitoring()
  }

  // Start continuous monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics()
    }, 5000) // Collect metrics every 5 seconds

    console.log("📊 [PERFORMANCE MONITOR] Started continuous monitoring")
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
    console.log("📊 [PERFORMANCE MONITOR] Stopped monitoring")
  }

  // Record performance metric
  recordMetric(operation: string, duration: number, status: "success" | "error" = "success", details?: any): void {
    const metric: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      operation,
      duration,
      memoryUsage: this.getMemoryUsage(),
      status,
      details,
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ [SLOW OPERATION] ${operation} took ${duration.toFixed(2)}ms`)
    }
  }

  // Measure operation performance
  async measureOperation<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now()
    let status: "success" | "error" = "success"
    let result: T

    try {
      result = await fn()
    } catch (error) {
      status = "error"
      this.recordMetric(operation, performance.now() - startTime, status, { error: error.message })
      throw error
    }

    this.recordMetric(operation, performance.now() - startTime, status)
    return result
  }

  // Get memory usage
  private getMemoryUsage(): number {
    if (typeof window !== "undefined") {
      // Browser environment
      return (performance as any).memory?.usedJSHeapSize || 0
    } else {
      // Node.js environment
      return process.memoryUsage().heapUsed
    }
  }

  // Collect system metrics
  private collectSystemMetrics(): void {
    const memoryUsage = this.getMemoryUsage()

    this.recordMetric("system_health_check", 0, "success", {
      memoryUsage,
      timestamp: new Date().toISOString(),
    })
  }

  // Get current system health
  async getSystemHealth(): Promise<SystemHealth> {
    const recentMetrics = this.metrics.filter(
      (m) => Date.now() - new Date(m.timestamp).getTime() < 300000, // Last 5 minutes
    )

    // Database health
    const dbMetrics = recentMetrics.filter(
      (m) => m.operation.includes("database") || m.operation.includes("get") || m.operation.includes("create"),
    )
    const avgResponseTime =
      dbMetrics.length > 0 ? dbMetrics.reduce((sum, m) => sum + m.duration, 0) / dbMetrics.length : 0
    const errorRate =
      dbMetrics.length > 0 ? (dbMetrics.filter((m) => m.status === "error").length / dbMetrics.length) * 100 : 0
    const throughput = dbMetrics.length / 5 // Operations per minute (5-minute window)

    // Memory analysis
    const memoryMetrics = recentMetrics.map((m) => m.memoryUsage).filter(Boolean)
    const currentMemory = memoryMetrics.length > 0 ? memoryMetrics[memoryMetrics.length - 1] : 0
    const maxMemory =
      typeof window !== "undefined" ? (performance as any).memory?.jsHeapSizeLimit || 2147483648 : 2147483648 // 2GB default
    const memoryPercentage = (currentMemory / maxMemory) * 100

    // Performance analysis
    const allMetrics = this.metrics.filter((m) => m.duration > 0)
    const averageResponseTime =
      allMetrics.length > 0 ? allMetrics.reduce((sum, m) => sum + m.duration, 0) / allMetrics.length : 0

    const slowestOperations = [...allMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map((m) => ({
        operation: m.operation,
        duration: m.duration,
        timestamp: m.timestamp,
      }))

    const fastestOperations = [...allMetrics]
      .sort((a, b) => a.duration - b.duration)
      .slice(0, 5)
      .map((m) => ({
        operation: m.operation,
        duration: m.duration,
        timestamp: m.timestamp,
      }))

    // Generate recommendations
    const recommendations: string[] = []

    if (avgResponseTime > 500) {
      recommendations.push("Database response time is high. Consider implementing caching.")
    }

    if (errorRate > 5) {
      recommendations.push("High error rate detected. Review error handling and data validation.")
    }

    if (memoryPercentage > 80) {
      recommendations.push("Memory usage is high. Consider implementing memory optimization.")
    }

    if (throughput < 10) {
      recommendations.push("Low throughput detected. Consider optimizing database queries.")
    }

    // Determine overall health
    let overall: "healthy" | "warning" | "critical" = "healthy"
    if (avgResponseTime > 1000 || errorRate > 10 || memoryPercentage > 90) {
      overall = "critical"
    } else if (avgResponseTime > 500 || errorRate > 5 || memoryPercentage > 70) {
      overall = "warning"
    }

    let dbStatus: "healthy" | "warning" | "critical" = "healthy"
    if (avgResponseTime > 1000 || errorRate > 10) {
      dbStatus = "critical"
    } else if (avgResponseTime > 500 || errorRate > 5) {
      dbStatus = "warning"
    }

    return {
      overall,
      database: {
        status: dbStatus,
        responseTime: avgResponseTime,
        errorRate,
        throughput,
      },
      memory: {
        used: currentMemory,
        available: maxMemory - currentMemory,
        percentage: memoryPercentage,
      },
      performance: {
        averageResponseTime,
        slowestOperations,
        fastestOperations,
      },
      recommendations,
    }
  }

  // Generate optimization report
  async generateOptimizationReport(): Promise<OptimizationReport> {
    const health = await this.getSystemHealth()
    const issues: OptimizationReport["issues"] = []
    const optimizations: OptimizationReport["optimizations"] = []

    // Analyze performance issues
    if (health.database.responseTime > 1000) {
      issues.push({
        severity: "critical",
        category: "performance",
        description: `Database response time is ${health.database.responseTime.toFixed(2)}ms (critical threshold: 1000ms)`,
        recommendation: "Implement database query optimization and caching",
        impact: "High - Affects user experience significantly",
      })

      optimizations.push({
        type: "cache",
        description: "Implement Redis caching for frequently accessed data",
        estimatedImprovement: "50-70% reduction in response time",
        implementation: "Add Redis cache layer with TTL-based invalidation",
      })
    } else if (health.database.responseTime > 500) {
      issues.push({
        severity: "medium",
        category: "performance",
        description: `Database response time is ${health.database.responseTime.toFixed(2)}ms (warning threshold: 500ms)`,
        recommendation: "Consider implementing selective caching",
        impact: "Medium - May affect user experience during peak usage",
      })
    }

    // Memory analysis
    if (health.memory.percentage > 90) {
      issues.push({
        severity: "critical",
        category: "memory",
        description: `Memory usage is ${health.memory.percentage.toFixed(1)}% (critical threshold: 90%)`,
        recommendation: "Implement memory cleanup and garbage collection optimization",
        impact: "Critical - May cause application crashes",
      })

      optimizations.push({
        type: "memory",
        description: "Implement memory pooling and object reuse patterns",
        estimatedImprovement: "30-50% reduction in memory usage",
        implementation: "Use object pools for frequently created/destroyed objects",
      })
    } else if (health.memory.percentage > 70) {
      issues.push({
        severity: "medium",
        category: "memory",
        description: `Memory usage is ${health.memory.percentage.toFixed(1)}% (warning threshold: 70%)`,
        recommendation: "Monitor memory usage patterns and implement cleanup routines",
        impact: "Medium - May lead to performance degradation",
      })
    }

    // Error rate analysis
    if (health.database.errorRate > 10) {
      issues.push({
        severity: "critical",
        category: "database",
        description: `Database error rate is ${health.database.errorRate.toFixed(1)}% (critical threshold: 10%)`,
        recommendation: "Review error handling, data validation, and connection management",
        impact: "Critical - Affects application reliability",
      })
    } else if (health.database.errorRate > 5) {
      issues.push({
        severity: "medium",
        category: "database",
        description: `Database error rate is ${health.database.errorRate.toFixed(1)}% (warning threshold: 5%)`,
        recommendation: "Implement better error handling and retry mechanisms",
        impact: "Medium - May cause intermittent failures",
      })
    }

    // Throughput analysis
    if (health.database.throughput < 5) {
      issues.push({
        severity: "high",
        category: "performance",
        description: `Database throughput is ${health.database.throughput.toFixed(1)} ops/min (minimum threshold: 5 ops/min)`,
        recommendation: "Optimize database queries and implement connection pooling",
        impact: "High - Affects application scalability",
      })

      optimizations.push({
        type: "query",
        description: "Implement database query optimization and indexing",
        estimatedImprovement: "100-200% increase in throughput",
        implementation: "Add database indexes and optimize slow queries",
      })
    }

    // Slow operations analysis
    const slowOps = health.performance.slowestOperations.filter((op) => op.duration > 1000)
    if (slowOps.length > 0) {
      issues.push({
        severity: "medium",
        category: "performance",
        description: `${slowOps.length} operations are taking longer than 1 second`,
        recommendation: "Optimize slow operations and implement async processing",
        impact: "Medium - Affects user experience for specific operations",
      })

      optimizations.push({
        type: "query",
        description: "Implement background processing for slow operations",
        estimatedImprovement: "Immediate response for users, background processing",
        implementation: "Use job queues for time-consuming operations",
      })
    }

    // Calculate overall score
    let score = 100
    issues.forEach((issue) => {
      switch (issue.severity) {
        case "critical":
          score -= 25
          break
        case "high":
          score -= 15
          break
        case "medium":
          score -= 10
          break
        case "low":
          score -= 5
          break
      }
    })

    score = Math.max(0, score)

    return {
      timestamp: new Date().toISOString(),
      issues,
      optimizations,
      score,
    }
  }

  // Get performance statistics
  getPerformanceStats() {
    const recentMetrics = this.metrics.filter(
      (m) => Date.now() - new Date(m.timestamp).getTime() < 3600000, // Last hour
    )

    const operationStats = new Map<string, { count: number; totalTime: number; errors: number }>()

    recentMetrics.forEach((metric) => {
      const existing = operationStats.get(metric.operation) || { count: 0, totalTime: 0, errors: 0 }
      existing.count++
      existing.totalTime += metric.duration
      if (metric.status === "error") existing.errors++
      operationStats.set(metric.operation, existing)
    })

    const stats = Array.from(operationStats.entries()).map(([operation, data]) => ({
      operation,
      count: data.count,
      averageTime: data.totalTime / data.count,
      errorRate: (data.errors / data.count) * 100,
      totalTime: data.totalTime,
    }))

    return {
      totalOperations: recentMetrics.length,
      uniqueOperations: stats.length,
      averageResponseTime:
        recentMetrics.length > 0 ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length : 0,
      errorRate:
        recentMetrics.length > 0
          ? (recentMetrics.filter((m) => m.status === "error").length / recentMetrics.length) * 100
          : 0,
      operationBreakdown: stats.sort((a, b) => b.averageTime - a.averageTime),
    }
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = []
    console.log("🗑️ [PERFORMANCE MONITOR] Cleared all metrics")
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      metrics: this.metrics,
      exportedAt: new Date().toISOString(),
      totalMetrics: this.metrics.length,
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Performance testing utilities
export const performanceTesting = {
  // Run comprehensive performance test
  async runPerformanceTest(): Promise<{
    databasePerformance: any
    memoryUsage: any
    operationBenchmarks: any
    recommendations: string[]
  }> {
    console.log("🚀 [PERFORMANCE TEST] Starting comprehensive performance test...")

    // Database performance test
    const dbStartTime = performance.now()
    const dbResults = await Promise.all([
      performanceMonitor.measureOperation("test_getProducts", () => enhancedMockDatabaseService.getProducts()),
      performanceMonitor.measureOperation("test_getCustomers", () => enhancedMockDatabaseService.getCustomers()),
      performanceMonitor.measureOperation("test_getOrders", () => enhancedMockDatabaseService.getOrders()),
      performanceMonitor.measureOperation("test_getAnalytics", () => enhancedMockDatabaseService.getAnalytics()),
    ])
    const dbTotalTime = performance.now() - dbStartTime

    // Memory usage test
    const memoryBefore = performanceMonitor["getMemoryUsage"]()

    // Create test data to measure memory impact
    const testData = []
    for (let i = 0; i < 1000; i++) {
      testData.push({
        id: i,
        name: `Test Product ${i}`,
        description: "A".repeat(100),
        data: new Array(100).fill(Math.random()),
      })
    }

    const memoryAfter = performanceMonitor["getMemoryUsage"]()
    const memoryDelta = memoryAfter - memoryBefore

    // Operation benchmarks
    const benchmarks = []
    const operations = [
      { name: "Simple Query", fn: () => enhancedMockDatabaseService.getProducts() },
      { name: "Complex Analytics", fn: () => enhancedMockDatabaseService.getAnalytics() },
      {
        name: "Data Creation",
        fn: () =>
          enhancedMockDatabaseService.createProduct({
            name: "Test Product",
            name_en: "Test Product",
            description: "Test Description",
            description_en: "Test Description",
            price: 100,
            images: ["/test.jpg"],
            category: "covers",
            specifications: {
              material: "Test",
              dimensions: "Test",
              colors: ["Test"],
              care_instructions: "Test",
            },
            stock: 10,
            status: "active",
            sold_count: 0,
            rating: 5,
            reviews_count: 0,
          }),
      },
    ]

    for (const operation of operations) {
      const times = []
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now()
        try {
          await operation.fn()
          times.push(performance.now() - startTime)
        } catch (error) {
          console.error(`Error in ${operation.name}:`, error)
        }
      }

      benchmarks.push({
        operation: operation.name,
        averageTime: times.reduce((a, b) => a + b, 0) / times.length,
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        samples: times.length,
      })
    }

    // Generate recommendations
    const recommendations = []

    if (dbTotalTime > 2000) {
      recommendations.push("Database operations are slow. Consider implementing caching.")
    }

    if (memoryDelta > 50 * 1024 * 1024) {
      // 50MB
      recommendations.push("High memory usage detected. Implement memory optimization.")
    }

    const slowBenchmarks = benchmarks.filter((b) => b.averageTime > 500)
    if (slowBenchmarks.length > 0) {
      recommendations.push(`Slow operations detected: ${slowBenchmarks.map((b) => b.operation).join(", ")}`)
    }

    console.log("✅ [PERFORMANCE TEST] Completed")

    return {
      databasePerformance: {
        totalTime: dbTotalTime,
        operationsCount: dbResults.length,
        averageTime: dbTotalTime / dbResults.length,
      },
      memoryUsage: {
        before: memoryBefore,
        after: memoryAfter,
        delta: memoryDelta,
        deltaFormatted: `${(memoryDelta / 1024 / 1024).toFixed(2)} MB`,
      },
      operationBenchmarks: benchmarks,
      recommendations,
    }
  },

  // Load testing
  async runLoadTest(concurrency = 10, duration = 30000): Promise<any> {
    console.log(`🔥 [LOAD TEST] Starting load test (${concurrency} concurrent users, ${duration}ms duration)`)

    const startTime = Date.now()
    const results = []
    const errors = []

    const runConcurrentTest = async () => {
      while (Date.now() - startTime < duration) {
        try {
          const operationStart = performance.now()
          await enhancedMockDatabaseService.getProducts()
          results.push(performance.now() - operationStart)
        } catch (error) {
          errors.push(error.message)
        }

        // Small delay to prevent overwhelming
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    // Run concurrent tests
    const promises = Array(concurrency)
      .fill(null)
      .map(() => runConcurrentTest())
    await Promise.all(promises)

    const totalOperations = results.length
    const averageTime = results.reduce((a, b) => a + b, 0) / totalOperations
    const minTime = Math.min(...results)
    const maxTime = Math.max(...results)
    const throughput = (totalOperations / (duration / 1000)).toFixed(2)

    console.log(`✅ [LOAD TEST] Completed - ${totalOperations} operations, ${throughput} ops/sec`)

    return {
      duration,
      concurrency,
      totalOperations,
      averageTime,
      minTime,
      maxTime,
      throughput: Number.parseFloat(throughput),
      errorRate: (errors.length / totalOperations) * 100,
      errors: errors.slice(0, 10), // First 10 errors
    }
  },

  // Memory leak detection
  async detectMemoryLeaks(iterations = 100): Promise<any> {
    console.log(`🔍 [MEMORY LEAK TEST] Starting memory leak detection (${iterations} iterations)`)

    const memorySnapshots = []

    for (let i = 0; i < iterations; i++) {
      // Perform operations that might cause memory leaks
      await enhancedMockDatabaseService.getProducts()
      await enhancedMockDatabaseService.getCustomers()
      await enhancedMockDatabaseService.getOrders()

      // Take memory snapshot every 10 iterations
      if (i % 10 === 0) {
        memorySnapshots.push({
          iteration: i,
          memory: performanceMonitor["getMemoryUsage"](),
          timestamp: Date.now(),
        })
      }
    }

    // Analyze memory trend
    const memoryGrowth = memorySnapshots.map((snapshot, index) => {
      if (index === 0) return 0
      return snapshot.memory - memorySnapshots[0].memory
    })

    const averageGrowth = memoryGrowth.reduce((a, b) => a + b, 0) / memoryGrowth.length
    const isLeaking = averageGrowth > 1024 * 1024 // 1MB growth threshold

    console.log(
      `${isLeaking ? "⚠️" : "✅"} [MEMORY LEAK TEST] ${isLeaking ? "Potential leak detected" : "No leaks detected"}`,
    )

    return {
      iterations,
      memorySnapshots,
      memoryGrowth,
      averageGrowth,
      averageGrowthFormatted: `${(averageGrowth / 1024 / 1024).toFixed(2)} MB`,
      isLeaking,
      recommendation: isLeaking
        ? "Memory leak detected. Review object lifecycle and cleanup routines."
        : "No memory leaks detected. Memory usage is stable.",
    }
  },
}

// Auto-start monitoring in development
if (developmentConfig.tools.showPerformanceMetrics) {
  performanceMonitor.startMonitoring()
}
