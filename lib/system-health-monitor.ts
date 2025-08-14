import { logger } from "./logger"
import { analytics } from "./analytics-service"

export interface HealthCheckResult {
  service: string
  status: "healthy" | "degraded" | "unhealthy"
  responseTime: number
  timestamp: string
  details?: Record<string, any>
  error?: string
}

export interface SystemHealth {
  overall: "healthy" | "degraded" | "unhealthy"
  services: HealthCheckResult[]
  uptime: number
  lastCheck: string
  metrics: {
    cpu: number
    memory: number
    disk: number
    activeConnections: number
  }
}

export class SystemHealthMonitor {
  private healthChecks: Map<string, () => Promise<HealthCheckResult>> = new Map()
  private lastHealthCheck: SystemHealth | null = null
  private monitoringInterval: NodeJS.Timeout | null = null

  constructor() {
    this.setupHealthChecks()
    this.startMonitoring()
  }

  private setupHealthChecks() {
    // Database health check
    this.healthChecks.set("database", async () => {
      const startTime = Date.now()
      try {
        // Test database connection
        const response = await fetch("/api/health/database", { method: "GET" })
        const responseTime = Date.now() - startTime

        if (response.ok) {
          const data = await response.json()
          return {
            service: "database",
            status: data.connectionCount > 50 ? "degraded" : "healthy",
            responseTime,
            timestamp: new Date().toISOString(),
            details: {
              connectionCount: data.connectionCount,
              queryTime: data.queryTime,
            },
          }
        } else {
          throw new Error(`Database health check failed: ${response.status}`)
        }
      } catch (error) {
        return {
          service: "database",
          status: "unhealthy",
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })

    // Supabase health check
    this.healthChecks.set("supabase", async () => {
      const startTime = Date.now()
      try {
        const response = await fetch("/api/health/supabase", { method: "GET" })
        const responseTime = Date.now() - startTime

        if (response.ok) {
          const data = await response.json()
          return {
            service: "supabase",
            status: data.status === "ok" ? "healthy" : "degraded",
            responseTime,
            timestamp: new Date().toISOString(),
            details: data,
          }
        } else {
          throw new Error(`Supabase health check failed: ${response.status}`)
        }
      } catch (error) {
        return {
          service: "supabase",
          status: "unhealthy",
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })

    // Email service health check
    this.healthChecks.set("email", async () => {
      const startTime = Date.now()
      try {
        const response = await fetch("/api/health/email", { method: "GET" })
        const responseTime = Date.now() - startTime

        if (response.ok) {
          return {
            service: "email",
            status: "healthy",
            responseTime,
            timestamp: new Date().toISOString(),
          }
        } else {
          throw new Error(`Email service health check failed: ${response.status}`)
        }
      } catch (error) {
        return {
          service: "email",
          status: "unhealthy",
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })

    // Payment service health check
    this.healthChecks.set("payment", async () => {
      const startTime = Date.now()
      try {
        const response = await fetch("/api/health/payment", { method: "GET" })
        const responseTime = Date.now() - startTime

        if (response.ok) {
          return {
            service: "payment",
            status: "healthy",
            responseTime,
            timestamp: new Date().toISOString(),
          }
        } else {
          throw new Error(`Payment service health check failed: ${response.status}`)
        }
      } catch (error) {
        return {
          service: "payment",
          status: "unhealthy",
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })

    // Storage service health check
    this.healthChecks.set("storage", async () => {
      const startTime = Date.now()
      try {
        const response = await fetch("/api/health/storage", { method: "GET" })
        const responseTime = Date.now() - startTime

        if (response.ok) {
          return {
            service: "storage",
            status: "healthy",
            responseTime,
            timestamp: new Date().toISOString(),
          }
        } else {
          throw new Error(`Storage service health check failed: ${response.status}`)
        }
      } catch (error) {
        return {
          service: "storage",
          status: "unhealthy",
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })

    // Analytics service health check
    this.healthChecks.set("analytics", async () => {
      const startTime = Date.now()
      try {
        // Test analytics service
        analytics.trackEvent("health_check", "system", "analytics_test", 1)
        const responseTime = Date.now() - startTime

        return {
          service: "analytics",
          status: "healthy",
          responseTime,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        return {
          service: "analytics",
          status: "unhealthy",
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })
  }

  async runHealthChecks(): Promise<SystemHealth> {
    const startTime = Date.now()
    const results: HealthCheckResult[] = []

    // Run all health checks in parallel
    const healthCheckPromises = Array.from(this.healthChecks.entries()).map(async ([name, check]) => {
      try {
        return await check()
      } catch (error) {
        return {
          service: name,
          status: "unhealthy" as const,
          responseTime: 0,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })

    const healthResults = await Promise.all(healthCheckPromises)
    results.push(...healthResults)

    // Get system metrics
    const metrics = await this.getSystemMetrics()

    // Determine overall health
    const unhealthyServices = results.filter((r) => r.status === "unhealthy")
    const degradedServices = results.filter((r) => r.status === "degraded")

    let overallStatus: "healthy" | "degraded" | "unhealthy"
    if (unhealthyServices.length > 0) {
      overallStatus = "unhealthy"
    } else if (degradedServices.length > 0) {
      overallStatus = "degraded"
    } else {
      overallStatus = "healthy"
    }

    const systemHealth: SystemHealth = {
      overall: overallStatus,
      services: results,
      uptime: process.uptime(),
      lastCheck: new Date().toISOString(),
      metrics,
    }

    this.lastHealthCheck = systemHealth

    // Log health status
    if (overallStatus !== "healthy") {
      logger.warn("System health check completed", {
        status: overallStatus,
        unhealthyServices: unhealthyServices.map((s) => s.service),
        degradedServices: degradedServices.map((s) => s.service),
      })
    } else {
      logger.info("System health check completed - all services healthy")
    }

    // Track metrics
    analytics.trackEvent("health_check_completed", "system", overallStatus, 1, {
      totalServices: results.length,
      healthyServices: results.filter((r) => r.status === "healthy").length,
      degradedServices: degradedServices.length,
      unhealthyServices: unhealthyServices.length,
      checkDuration: Date.now() - startTime,
    })

    return systemHealth
  }

  private async getSystemMetrics() {
    try {
      // In a real implementation, these would come from system monitoring
      return {
        cpu: Math.random() * 100, // Mock CPU usage
        memory: Math.random() * 100, // Mock memory usage
        disk: Math.random() * 100, // Mock disk usage
        activeConnections: Math.floor(Math.random() * 100), // Mock active connections
      }
    } catch (error) {
      logger.error("Failed to get system metrics:", error)
      return {
        cpu: 0,
        memory: 0,
        disk: 0,
        activeConnections: 0,
      }
    }
  }

  private startMonitoring() {
    // Run health checks every 5 minutes
    this.monitoringInterval = setInterval(
      async () => {
        await this.runHealthChecks()
      },
      5 * 60 * 1000,
    )

    // Run initial health check
    this.runHealthChecks()
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  getLastHealthCheck(): SystemHealth | null {
    return this.lastHealthCheck
  }

  // Alert system for critical issues
  async checkForAlerts(): Promise<void> {
    if (!this.lastHealthCheck) return

    const criticalServices = this.lastHealthCheck.services.filter((s) => s.status === "unhealthy")

    if (criticalServices.length > 0) {
      // Send alerts for critical services
      for (const service of criticalServices) {
        await this.sendAlert({
          type: "service_down",
          service: service.service,
          message: `Service ${service.service} is unhealthy: ${service.error}`,
          severity: "critical",
          timestamp: service.timestamp,
        })
      }
    }

    // Check system metrics for alerts
    const { metrics } = this.lastHealthCheck
    if (metrics.cpu > 90) {
      await this.sendAlert({
        type: "high_cpu",
        message: `High CPU usage detected: ${metrics.cpu.toFixed(1)}%`,
        severity: "warning",
        timestamp: new Date().toISOString(),
      })
    }

    if (metrics.memory > 90) {
      await this.sendAlert({
        type: "high_memory",
        message: `High memory usage detected: ${metrics.memory.toFixed(1)}%`,
        severity: "warning",
        timestamp: new Date().toISOString(),
      })
    }
  }

  private async sendAlert(alert: {
    type: string
    service?: string
    message: string
    severity: "info" | "warning" | "critical"
    timestamp: string
  }) {
    logger.error("System Alert", alert)

    // In a real implementation, send to alerting system (Slack, email, etc.)
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      })
    } catch (error) {
      logger.error("Failed to send alert:", error)
    }
  }

  // Performance testing
  async runPerformanceTest(): Promise<{
    responseTime: number
    throughput: number
    errorRate: number
    concurrentUsers: number
  }> {
    const testDuration = 30000 // 30 seconds
    const concurrentUsers = 10
    const requests: Promise<any>[] = []
    const results: { success: boolean; responseTime: number }[] = []

    const startTime = Date.now()

    // Simulate concurrent users
    for (let i = 0; i < concurrentUsers; i++) {
      const userRequests = this.simulateUserRequests(testDuration)
      requests.push(userRequests)
    }

    const allResults = await Promise.all(requests)
    allResults.forEach((userResults) => results.push(...userResults))

    const totalTime = Date.now() - startTime
    const successfulRequests = results.filter((r) => r.success).length
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length

    return {
      responseTime: averageResponseTime,
      throughput: (successfulRequests / totalTime) * 1000, // requests per second
      errorRate: ((results.length - successfulRequests) / results.length) * 100,
      concurrentUsers,
    }
  }

  private async simulateUserRequests(duration: number): Promise<{ success: boolean; responseTime: number }[]> {
    const results: { success: boolean; responseTime: number }[] = []
    const endTime = Date.now() + duration

    while (Date.now() < endTime) {
      const startTime = Date.now()
      try {
        const response = await fetch("/api/health", { method: "GET" })
        const responseTime = Date.now() - startTime
        results.push({ success: response.ok, responseTime })
      } catch (error) {
        const responseTime = Date.now() - startTime
        results.push({ success: false, responseTime })
      }

      // Wait a bit before next request
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return results
  }
}

export const systemHealthMonitor = new SystemHealthMonitor()
export type { SystemHealth, HealthCheckResult }
