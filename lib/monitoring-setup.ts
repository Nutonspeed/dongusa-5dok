// Comprehensive monitoring and observability setup

interface MetricData {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
  unit?: string
}

interface LogEntry {
  level: "debug" | "info" | "warn" | "error" | "fatal"
  message: string
  timestamp: number
  context?: Record<string, any>
  userId?: string
  requestId?: string
  error?: Error
}

interface HealthCheckResult {
  service: string
  status: "healthy" | "unhealthy" | "degraded"
  responseTime: number
  details?: Record<string, any>
  timestamp: number
}

export class MonitoringService {
  private metrics: MetricData[] = []
  private logs: LogEntry[] = []
  private healthChecks: Map<string, HealthCheckResult> = new Map()
  private alertThresholds: Map<string, { warning: number; critical: number }> = new Map()

  constructor() {
    this.setupDefaultThresholds()
    this.startPeriodicHealthChecks()
  }

  private setupDefaultThresholds() {
    this.alertThresholds.set("response_time", { warning: 1000, critical: 3000 })
    this.alertThresholds.set("error_rate", { warning: 0.05, critical: 0.1 })
    this.alertThresholds.set("memory_usage", { warning: 0.8, critical: 0.9 })
    this.alertThresholds.set("cpu_usage", { warning: 0.7, critical: 0.9 })
  }

  // Metrics collection
  recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string) {
    const metric: MetricData = {
      name,
      value,
      timestamp: Date.now(),
      tags,
      unit,
    }

    this.metrics.push(metric)
    this.checkAlertThresholds(metric)
    this.cleanupOldMetrics()

    // Send to external monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.sendMetricToExternalService(metric)
    }
  }

  // Logging
  log(level: LogEntry["level"], message: string, context?: Record<string, any>, error?: Error) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      error,
      requestId: this.getCurrentRequestId(),
      userId: this.getCurrentUserId(),
    }

    this.logs.push(logEntry)
    this.cleanupOldLogs()

    // Console output for development
    if (process.env.NODE_ENV === "development") {
      const logMethod =
        level === "error" || level === "fatal" ? console.error : level === "warn" ? console.warn : console.log

      logMethod(`[${level.toUpperCase()}] ${message}`, context || "", error || "")
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === "production") {
      this.sendLogToExternalService(logEntry)
    }

    // Trigger alerts for errors
    if (level === "error" || level === "fatal") {
      this.triggerErrorAlert(logEntry)
    }
  }

  // Health checks
  async performHealthCheck(serviceName: string, checkFunction: () => Promise<any>): Promise<HealthCheckResult> {
    const startTime = performance.now()

    try {
      const result = await checkFunction()
      const responseTime = performance.now() - startTime

      const healthResult: HealthCheckResult = {
        service: serviceName,
        status: responseTime > 5000 ? "degraded" : "healthy",
        responseTime,
        details: result,
        timestamp: Date.now(),
      }

      this.healthChecks.set(serviceName, healthResult)
      this.recordMetric(`health_check_${serviceName}`, responseTime, { service: serviceName }, "ms")

      return healthResult
    } catch (error) {
      const responseTime = performance.now() - startTime

      const healthResult: HealthCheckResult = {
        service: serviceName,
        status: "unhealthy",
        responseTime,
        details: { error: error.message },
        timestamp: Date.now(),
      }

      this.healthChecks.set(serviceName, healthResult)
      this.log("error", `Health check failed for ${serviceName}`, { service: serviceName }, error as Error)

      return healthResult
    }
  }

  // Application Performance Monitoring (APM)
  async traceOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    const traceId = this.generateTraceId()
    const startTime = performance.now()

    this.log("debug", `Starting operation: ${operationName}`, { traceId, operationName })

    try {
      const result = await operation()
      const duration = performance.now() - startTime

      this.recordMetric(
        "operation_duration",
        duration,
        {
          operation: operationName,
          status: "success",
        },
        "ms",
      )

      this.log("debug", `Completed operation: ${operationName}`, {
        traceId,
        operationName,
        duration,
      })

      return result
    } catch (error) {
      const duration = performance.now() - startTime

      this.recordMetric(
        "operation_duration",
        duration,
        {
          operation: operationName,
          status: "error",
        },
        "ms",
      )

      this.log(
        "error",
        `Failed operation: ${operationName}`,
        {
          traceId,
          operationName,
          duration,
        },
        error as Error,
      )

      throw error
    }
  }

  // Real User Monitoring (RUM)
  recordUserMetric(metricName: string, value: number, userContext?: Record<string, any>) {
    this.recordMetric(`user_${metricName}`, value, {
      ...userContext,
      type: "user_metric",
    })
  }

  // Error tracking
  captureException(error: Error, context?: Record<string, any>) {
    this.log(
      "error",
      error.message,
      {
        ...context,
        stack: error.stack,
        name: error.name,
      },
      error,
    )

    // Send to error tracking service
    if (process.env.NODE_ENV === "production") {
      this.sendErrorToTrackingService(error, context)
    }
  }

  // Alert management
  private checkAlertThresholds(metric: MetricData) {
    const threshold = this.alertThresholds.get(metric.name)
    if (!threshold) return

    if (metric.value >= threshold.critical) {
      this.triggerAlert("critical", `${metric.name} exceeded critical threshold`, {
        metric: metric.name,
        value: metric.value,
        threshold: threshold.critical,
      })
    } else if (metric.value >= threshold.warning) {
      this.triggerAlert("warning", `${metric.name} exceeded warning threshold`, {
        metric: metric.name,
        value: metric.value,
        threshold: threshold.warning,
      })
    }
  }

  private triggerAlert(severity: "warning" | "critical", message: string, context: Record<string, any>) {
    this.log("error", `ALERT [${severity.toUpperCase()}]: ${message}`, context)

    // Send to alerting service
    if (process.env.NODE_ENV === "production") {
      this.sendAlert(severity, message, context)
    }
  }

  private triggerErrorAlert(logEntry: LogEntry) {
    if (logEntry.level === "fatal") {
      this.triggerAlert("critical", `Fatal error: ${logEntry.message}`, logEntry.context || {})
    } else if (logEntry.level === "error") {
      // Check error rate
      const recentErrors = this.logs.filter(
        (log) => log.level === "error" && log.timestamp > Date.now() - 300000, // Last 5 minutes
      ).length

      if (recentErrors > 10) {
        this.triggerAlert("warning", `High error rate: ${recentErrors} errors in 5 minutes`, {
          errorCount: recentErrors,
        })
      }
    }
  }

  // Dashboard data
  getDashboardData() {
    const now = Date.now()
    const oneHourAgo = now - 3600000

    const recentMetrics = this.metrics.filter((m) => m.timestamp > oneHourAgo)
    const recentLogs = this.logs.filter((l) => l.timestamp > oneHourAgo)

    return {
      metrics: {
        total: recentMetrics.length,
        byName: this.groupMetricsByName(recentMetrics),
        averages: this.calculateMetricAverages(recentMetrics),
      },
      logs: {
        total: recentLogs.length,
        byLevel: this.groupLogsByLevel(recentLogs),
        errors: recentLogs.filter((l) => l.level === "error" || l.level === "fatal"),
      },
      healthChecks: Array.from(this.healthChecks.values()),
      systemHealth: this.calculateOverallHealth(),
    }
  }

  // Utility methods
  private getCurrentRequestId(): string | undefined {
    // In a real implementation, this would get the request ID from context
    return typeof window !== "undefined" ? undefined : "mock-request-id"
  }

  private getCurrentUserId(): string | undefined {
    // In a real implementation, this would get the user ID from session
    return undefined
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private cleanupOldMetrics() {
    const cutoff = Date.now() - 86400000 // 24 hours
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff)
  }

  private cleanupOldLogs() {
    const cutoff = Date.now() - 86400000 // 24 hours
    this.logs = this.logs.filter((l) => l.timestamp > cutoff)
  }

  private groupMetricsByName(metrics: MetricData[]) {
    return metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.name]) {
          acc[metric.name] = []
        }
        acc[metric.name].push(metric)
        return acc
      },
      {} as Record<string, MetricData[]>,
    )
  }

  private calculateMetricAverages(metrics: MetricData[]) {
    const grouped = this.groupMetricsByName(metrics)
    const averages: Record<string, number> = {}

    for (const [name, metricList] of Object.entries(grouped)) {
      const sum = metricList.reduce((acc, m) => acc + m.value, 0)
      averages[name] = sum / metricList.length
    }

    return averages
  }

  private groupLogsByLevel(logs: LogEntry[]) {
    return logs.reduce(
      (acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private calculateOverallHealth(): "healthy" | "degraded" | "unhealthy" {
    const healthResults = Array.from(this.healthChecks.values())

    if (healthResults.length === 0) return "healthy"

    const unhealthyCount = healthResults.filter((h) => h.status === "unhealthy").length
    const degradedCount = healthResults.filter((h) => h.status === "degraded").length

    if (unhealthyCount > 0) return "unhealthy"
    if (degradedCount > 0) return "degraded"

    return "healthy"
  }

  // External service integrations
  private async sendMetricToExternalService(metric: MetricData) {
    // Integration with DataDog, New Relic, etc.
    try {
      await fetch("/api/monitoring/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metric),
      })
    } catch (error) {
      console.error("Failed to send metric to external service:", error)
    }
  }

  private async sendLogToExternalService(logEntry: LogEntry) {
    // Integration with LogRocket, Splunk, etc.
    try {
      await fetch("/api/monitoring/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logEntry),
      })
    } catch (error) {
      console.error("Failed to send log to external service:", error)
    }
  }

  private async sendErrorToTrackingService(error: Error, context?: Record<string, any>) {
    // Integration with Sentry, Bugsnag, etc.
    try {
      await fetch("/api/monitoring/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          name: error.name,
          context,
          timestamp: Date.now(),
        }),
      })
    } catch (err) {
      console.error("Failed to send error to tracking service:", err)
    }
  }

  private async sendAlert(severity: string, message: string, context: Record<string, any>) {
    // Integration with PagerDuty, Slack, etc.
    try {
      await fetch("/api/monitoring/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          severity,
          message,
          context,
          timestamp: Date.now(),
        }),
      })
    } catch (error) {
      console.error("Failed to send alert:", error)
    }
  }

  // Health check implementations
  private startPeriodicHealthChecks() {
    setInterval(async () => {
      await this.performHealthCheck("database", async () => {
        // Check database connectivity
        return { status: "connected", latency: Math.random() * 100 }
      })

      await this.performHealthCheck("external_apis", async () => {
        // Check external API connectivity
        return { status: "available", services: ["payment", "email"] }
      })

      await this.performHealthCheck("memory", async () => {
        // Check memory usage
        const usage = process.memoryUsage()
        return {
          heapUsed: usage.heapUsed,
          heapTotal: usage.heapTotal,
          external: usage.external,
        }
      })
    }, 60000) // Every minute
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService()

// Monitoring middleware for Next.js API routes
export function withMonitoring<T extends (...args: any[]) => any>(handler: T, operationName?: string): T {
  return (async (...args: any[]) => {
    const name = operationName || handler.name || "api_request"

    return monitoring.traceOperation(name, async () => {
      try {
        const result = await handler(...args)
        monitoring.recordMetric("api_request_success", 1, { operation: name })
        return result
      } catch (error) {
        monitoring.recordMetric("api_request_error", 1, { operation: name })
        monitoring.captureException(error as Error, { operation: name })
        throw error
      }
    })
  }) as T
}

// React hook for client-side monitoring
export function useMonitoring() {
  const recordMetric = (name: string, value: number, tags?: Record<string, string>) => {
    monitoring.recordUserMetric(name, value, tags)
  }

  const logError = (error: Error, context?: Record<string, any>) => {
    monitoring.captureException(error, context)
  }

  const startTimer = (operationName: string) => {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      recordMetric("operation_duration", duration, { operation: operationName })
    }
  }

  return {
    recordMetric,
    logError,
    startTimer,
  }
}
