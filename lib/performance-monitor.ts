import { developmentConfig } from "./development-config"

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

interface SystemHealth {
  status: "healthy" | "warning" | "critical"
  uptime: number
  memoryUsage: number
  responseTime: number
  errorRate: number
  lastChecked: string
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private completedMetrics: PerformanceMetric[] = []
  private healthChecks: SystemHealth[] = []
  private errorLog: Array<{ timestamp: string; error: string; context?: any }> = []

  // Start tracking a performance metric
  startMetric(name: string, metadata?: Record<string, any>): void {
    if (!developmentConfig.tools.showPerformanceMetrics) return

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    })

    console.log(`🚀 [PERF] Started tracking: ${name}`)
  }

  // End tracking a performance metric
  endMetric(name: string): number {
    if (!developmentConfig.tools.showPerformanceMetrics) return 0

    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`⚠️ [PERF] Metric not found: ${name}`)
      return 0
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    const completedMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration,
    }

    this.completedMetrics.push(completedMetric)
    this.metrics.delete(name)

    // Keep only last 1000 metrics
    if (this.completedMetrics.length > 1000) {
      this.completedMetrics = this.completedMetrics.slice(-1000)
    }

    console.log(`✅ [PERF] ${name}: ${duration.toFixed(2)}ms`)
    return duration
  }

  // Log an error
  logError(error: string, context?: any): void {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error,
      context,
    }

    this.errorLog.push(errorEntry)

    // Keep only last 500 errors
    if (this.errorLog.length > 500) {
      this.errorLog = this.errorLog.slice(-500)
    }

    console.error(`❌ [ERROR] ${error}`, context)
  }

  // Perform system health check
  async performHealthCheck(): Promise<SystemHealth> {
    const startTime = performance.now()

    try {
      // Simulate health checks
      await new Promise((resolve) => setTimeout(resolve, 10))

      const responseTime = performance.now() - startTime
      const errorRate = this.calculateErrorRate()

      const health: SystemHealth = {
        status: this.determineHealthStatus(responseTime, errorRate),
        uptime: performance.now(),
        memoryUsage: this.getMemoryUsage(),
        responseTime,
        errorRate,
        lastChecked: new Date().toISOString(),
      }

      this.healthChecks.push(health)

      // Keep only last 100 health checks
      if (this.healthChecks.length > 100) {
        this.healthChecks = this.healthChecks.slice(-100)
      }

      return health
    } catch (error) {
      this.logError("Health check failed", error)
      return {
        status: "critical",
        uptime: 0,
        memoryUsage: 0,
        responseTime: 0,
        errorRate: 1,
        lastChecked: new Date().toISOString(),
      }
    }
  }

  // Get performance statistics
  getPerformanceStats(): {
    totalMetrics: number
    averageResponseTime: number
    slowestOperations: PerformanceMetric[]
    fastestOperations: PerformanceMetric[]
    errorRate: number
    recentErrors: typeof this.errorLog
  } {
    const metricsWithDuration = this.completedMetrics.filter((m) => m.duration !== undefined)
    const totalMetrics = metricsWithDuration.length

    const averageResponseTime =
      totalMetrics > 0 ? metricsWithDuration.reduce((sum, m) => sum + (m.duration || 0), 0) / totalMetrics : 0

    const sortedByDuration = [...metricsWithDuration].sort((a, b) => (b.duration || 0) - (a.duration || 0))

    return {
      totalMetrics,
      averageResponseTime,
      slowestOperations: sortedByDuration.slice(0, 10),
      fastestOperations: sortedByDuration.slice(-10).reverse(),
      errorRate: this.calculateErrorRate(),
      recentErrors: this.errorLog.slice(-10),
    }
  }

  // Get system health history
  getHealthHistory(): SystemHealth[] {
    return [...this.healthChecks]
  }

  // Clear all metrics and logs
  clear(): void {
    this.metrics.clear()
    this.completedMetrics = []
    this.healthChecks = []
    this.errorLog = []
    console.log("🧹 [PERF] Cleared all performance data")
  }

  // Private helper methods
  private calculateErrorRate(): number {
    const recentErrors = this.errorLog.filter(
      (error) => Date.now() - new Date(error.timestamp).getTime() < 60000, // Last minute
    )
    const recentMetrics = this.completedMetrics.filter((metric) => Date.now() - (metric.endTime || 0) < 60000)

    return recentMetrics.length > 0 ? recentErrors.length / recentMetrics.length : 0
  }

  private determineHealthStatus(responseTime: number, errorRate: number): SystemHealth["status"] {
    if (errorRate > 0.1 || responseTime > 1000) return "critical"
    if (errorRate > 0.05 || responseTime > 500) return "warning"
    return "healthy"
  }

  private getMemoryUsage(): number {
    // In a real browser environment, this would use performance.memory
    // For now, return a simulated value
    return Math.random() * 100
  }

  // Automatic monitoring
  startAutoMonitoring(): void {
    if (!developmentConfig.tools.showPerformanceMetrics) return

    // Perform health check every 30 seconds
    setInterval(async () => {
      await this.performHealthCheck()
    }, 30000)

    console.log("🔄 [PERF] Auto monitoring started")
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Utility functions for easy use
export const startPerformanceTracking = (name: string, metadata?: Record<string, any>) => {
  performanceMonitor.startMetric(name, metadata)
}

export const endPerformanceTracking = (name: string): number => {
  return performanceMonitor.endMetric(name)
}

export const logPerformanceError = (error: string, context?: any) => {
  performanceMonitor.logError(error, context)
}

// Auto-start monitoring in development
if (typeof window !== "undefined" && developmentConfig.tools.showPerformanceMetrics) {
  performanceMonitor.startAutoMonitoring()
}
