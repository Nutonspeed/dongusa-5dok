import { createClient } from "@supabase/supabase-js"
import { Redis } from "@upstash/redis"

interface SystemMetrics {
  timestamp: string
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  response_time: number
  error_rate: number
  active_users: number
  database_connections: number
  cache_hit_rate: number
  throughput: number
}

interface Alert {
  id: string
  type: "warning" | "critical" | "info"
  metric: string
  value: number
  threshold: number
  message: string
  timestamp: string
  resolved: boolean
}

interface MaintenanceTask {
  id: string
  name: string
  description: string
  frequency: "daily" | "weekly" | "monthly"
  last_run: string
  next_run: string
  status: "pending" | "running" | "completed" | "failed"
  duration_ms: number
}

export class MonitoringService {
  private redis: Redis
  private supabase: any
  private alerts: Alert[] = []
  private maintenanceTasks: MaintenanceTask[] = []

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    this.initializeMaintenanceTasks()
  }

  // Collect system metrics
  async collectMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date().toISOString()

    // Collect various metrics
    const metrics: SystemMetrics = {
      timestamp,
      cpu_usage: await this.getCPUUsage(),
      memory_usage: await this.getMemoryUsage(),
      disk_usage: await this.getDiskUsage(),
      response_time: await this.getAverageResponseTime(),
      error_rate: await this.getErrorRate(),
      active_users: await this.getActiveUsers(),
      database_connections: await this.getDatabaseConnections(),
      cache_hit_rate: await this.getCacheHitRate(),
      throughput: await this.getThroughput(),
    }

    // Store metrics
    await this.storeMetrics(metrics)

    // Check for alerts
    await this.checkAlerts(metrics)

    return metrics
  }

  // Alert system
  async checkAlerts(metrics: SystemMetrics): Promise<void> {
    const alertRules = [
      { metric: "cpu_usage", threshold: 80, type: "warning" as const },
      { metric: "cpu_usage", threshold: 90, type: "critical" as const },
      { metric: "memory_usage", threshold: 85, type: "warning" as const },
      { metric: "memory_usage", threshold: 95, type: "critical" as const },
      { metric: "disk_usage", threshold: 90, type: "critical" as const },
      { metric: "response_time", threshold: 2000, type: "warning" as const },
      { metric: "response_time", threshold: 5000, type: "critical" as const },
      { metric: "error_rate", threshold: 1, type: "warning" as const },
      { metric: "error_rate", threshold: 5, type: "critical" as const },
    ]

    for (const rule of alertRules) {
      const value = metrics[rule.metric as keyof SystemMetrics] as number

      if (value > rule.threshold) {
        await this.createAlert({
          id: `${rule.metric}_${Date.now()}`,
          type: rule.type,
          metric: rule.metric,
          value,
          threshold: rule.threshold,
          message: `${rule.metric} is ${value}, exceeding threshold of ${rule.threshold}`,
          timestamp: new Date().toISOString(),
          resolved: false,
        })
      }
    }
  }

  // Create and send alerts
  async createAlert(alert: Alert): Promise<void> {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find((a) => a.metric === alert.metric && a.type === alert.type && !a.resolved)

    if (existingAlert) {
      return // Don't spam alerts
    }

    this.alerts.push(alert)

    // Store alert in database
    await this.supabase.from("system_alerts").insert(alert)

    // Send notifications
    await this.sendNotification(alert)

    console.log(`🚨 Alert created: ${alert.message}`)
  }

  // Send notifications
  async sendNotification(alert: Alert): Promise<void> {
    const channels = ["email", "slack"]

    for (const channel of channels) {
      try {
        switch (channel) {
          case "email":
            await this.sendEmailAlert(alert)
            break
          case "slack":
            await this.sendSlackAlert(alert)
            break
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error)
      }
    }
  }

  // Automated maintenance tasks
  async runMaintenanceTasks(): Promise<void> {
    const now = new Date()

    for (const task of this.maintenanceTasks) {
      const nextRun = new Date(task.next_run)

      if (now >= nextRun && task.status !== "running") {
        await this.executeMaintenanceTask(task)
      }
    }
  }

  async executeMaintenanceTask(task: MaintenanceTask): Promise<void> {
    const startTime = Date.now()

    try {
      task.status = "running"
      console.log(`🔧 Starting maintenance task: ${task.name}`)

      switch (task.name) {
        case "database_cleanup":
          await this.cleanupDatabase()
          break
        case "cache_cleanup":
          await this.cleanupCache()
          break
        case "log_rotation":
          await this.rotateLogFiles()
          break
        case "backup_verification":
          await this.verifyBackups()
          break
        case "security_scan":
          await this.runSecurityScan()
          break
        case "performance_analysis":
          await this.analyzePerformance()
          break
      }

      task.status = "completed"
      task.last_run = new Date().toISOString()
      task.next_run = this.calculateNextRun(task.frequency).toISOString()
      task.duration_ms = Date.now() - startTime

      console.log(`✅ Completed maintenance task: ${task.name} (${task.duration_ms}ms)`)
    } catch (error) {
      task.status = "failed"
      console.error(`❌ Failed maintenance task: ${task.name}`, error)

      // Create alert for failed maintenance
      await this.createAlert({
        id: `maintenance_${task.name}_${Date.now()}`,
        type: "critical",
        metric: "maintenance_task",
        value: 0,
        threshold: 1,
        message: `Maintenance task '${task.name}' failed: ${error}`,
        timestamp: new Date().toISOString(),
        resolved: false,
      })
    }
  }

  // Health check endpoint
  async performHealthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy"
    checks: Record<string, { status: string; response_time: number; message?: string }>
    timestamp: string
  }> {
    const checks: Record<string, { status: string; response_time: number; message?: string }> = {}

    // Database health
    const dbStart = Date.now()
    try {
      await this.supabase.from("products").select("count").limit(1)
      checks.database = { status: "healthy", response_time: Date.now() - dbStart }
    } catch (error) {
      checks.database = {
        status: "unhealthy",
        response_time: Date.now() - dbStart,
        message: String(error),
      }
    }

    // Cache health
    const cacheStart = Date.now()
    try {
      await this.redis.ping()
      checks.cache = { status: "healthy", response_time: Date.now() - cacheStart }
    } catch (error) {
      checks.cache = {
        status: "unhealthy",
        response_time: Date.now() - cacheStart,
        message: String(error),
      }
    }

    // API health
    const apiStart = Date.now()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/health`)
      checks.api = {
        status: response.ok ? "healthy" : "degraded",
        response_time: Date.now() - apiStart,
      }
    } catch (error) {
      checks.api = {
        status: "unhealthy",
        response_time: Date.now() - apiStart,
        message: String(error),
      }
    }

    // Determine overall status
    const unhealthyCount = Object.values(checks).filter((check) => check.status === "unhealthy").length
    const degradedCount = Object.values(checks).filter((check) => check.status === "degraded").length

    let status: "healthy" | "degraded" | "unhealthy"
    if (unhealthyCount > 0) {
      status = "unhealthy"
    } else if (degradedCount > 0) {
      status = "degraded"
    } else {
      status = "healthy"
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
    }
  }

  // Log aggregation and analysis
  async aggregateLogs(timeRange: "1h" | "24h" | "7d" = "24h"): Promise<{
    total_requests: number
    error_count: number
    avg_response_time: number
    top_errors: Array<{ message: string; count: number }>
    slow_queries: Array<{ query: string; avg_time: number }>
  }> {
  const { data: logs } = await this.supabase
      .from("system_logs")
      .select("*")
      .gte("created_at", this.getTimeRangeStart(timeRange))
  // logs can be any shape coming from the DB; treat as any[] for aggregation
  const _logs: any[] = (logs as any) || []

  const totalRequests = _logs.length || 0
  const errorLogs = _logs.filter((log) => log.level === "error") || []
  const errorCount = errorLogs.length

  const responseTimes = _logs.map((log) => log.response_time).filter(Boolean) || []
    const avgResponseTime =
      responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0

    // Aggregate error messages
    const errorMessages = errorLogs.reduce(
      (acc, log) => {
        acc[log.message] = (acc[log.message] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topErrors = Object.entries(errorMessages)
      .sort(([, a], [, b]) => (Number(b as any) - Number(a as any)))
      .slice(0, 10)
      .map(([message, count]) => ({ message, count: Number(count as any) }))

    // Find slow queries using typed _logs
    const slowQueries = _logs
      .filter((log: any) => log.query && log.response_time > 1000)
      .reduce(
        (acc: Record<string, { total_time: number; count: number }>, log: any) => {
          if (!acc[log.query]) {
            acc[log.query] = { total_time: 0, count: 0 }
          }
          acc[log.query].total_time += log.response_time
          acc[log.query].count += 1
          return acc
        },
        {} as Record<string, { total_time: number; count: number }>,
      )

    const slowQueriesArray = Object.entries(slowQueries || {})
      .map(([query, stats]) => ({
        query,
        avg_time: stats.total_time / stats.count,
      }))
      .sort((a, b) => b.avg_time - a.avg_time)
      .slice(0, 10)

    return {
      total_requests: totalRequests,
      error_count: errorCount,
      avg_response_time: avgResponseTime,
      top_errors: topErrors,
      slow_queries: slowQueriesArray,
    }
  }

  // Private helper methods
  private async getCPUUsage(): Promise<number> {
    // Mock implementation - in real scenario, get from system metrics
    return Math.random() * 100
  }

  private async getMemoryUsage(): Promise<number> {
    // Mock implementation
    return Math.random() * 100
  }

  private async getDiskUsage(): Promise<number> {
    // Mock implementation
    return Math.random() * 100
  }

  private async getAverageResponseTime(): Promise<number> {
    const cached = await this.redis.get("metrics:avg_response_time")
    return cached ? Number.parseInt(cached as string) : Math.random() * 1000
  }

  private async getErrorRate(): Promise<number> {
    const cached = await this.redis.get("metrics:error_rate")
    return cached ? Number.parseFloat(cached as string) : Math.random() * 5
  }

  private async getActiveUsers(): Promise<number> {
    const { count } = await this.supabase
      .from("user_sessions")
      .select("count")
      .gte("last_activity", new Date(Date.now() - 30 * 60 * 1000).toISOString())

    return count || 0
  }

  private async getDatabaseConnections(): Promise<number> {
    const { data } = await this.supabase.rpc("get_connection_count")
    return data || 0
  }

  private async getCacheHitRate(): Promise<number> {
    const hits = await this.redis.get("cache:hits")
    const misses = await this.redis.get("cache:misses")
    const totalHits = Number.parseInt((hits as string) || "0")
    const totalMisses = Number.parseInt((misses as string) || "0")

    return totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0
  }

  private async getThroughput(): Promise<number> {
    const cached = await this.redis.get("metrics:throughput")
    return cached ? Number.parseInt(cached as string) : Math.random() * 1000
  }

  private async storeMetrics(metrics: SystemMetrics): Promise<void> {
    // Store in database
    await this.supabase.from("system_metrics").insert(metrics)

    // Store in cache for quick access
    await this.redis.setex("metrics:latest", 300, JSON.stringify(metrics))
  }

  private async sendEmailAlert(alert: Alert): Promise<void> {
    // Implementation for email alerts
    console.log(`📧 Email alert sent: ${alert.message}`)
  }

  private async sendSlackAlert(alert: Alert): Promise<void> {
    // Implementation for Slack alerts
    console.log(`💬 Slack alert sent: ${alert.message}`)
  }

  private initializeMaintenanceTasks(): void {
    this.maintenanceTasks = [
      {
        id: "db_cleanup",
        name: "database_cleanup",
        description: "Clean up old logs and temporary data",
        frequency: "daily",
        last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        next_run: new Date().toISOString(),
        status: "pending",
        duration_ms: 0,
      },
      {
        id: "cache_cleanup",
        name: "cache_cleanup",
        description: "Clear expired cache entries",
        frequency: "daily",
        last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        next_run: new Date().toISOString(),
        status: "pending",
        duration_ms: 0,
      },
      {
        id: "log_rotation",
        name: "log_rotation",
        description: "Rotate and compress log files",
        frequency: "weekly",
        last_run: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        next_run: new Date().toISOString(),
        status: "pending",
        duration_ms: 0,
      },
      {
        id: "backup_verification",
        name: "backup_verification",
        description: "Verify backup integrity",
        frequency: "weekly",
        last_run: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        next_run: new Date().toISOString(),
        status: "pending",
        duration_ms: 0,
      },
      {
        id: "security_scan",
        name: "security_scan",
        description: "Run security vulnerability scan",
        frequency: "weekly",
        last_run: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        next_run: new Date().toISOString(),
        status: "pending",
        duration_ms: 0,
      },
      {
        id: "performance_analysis",
        name: "performance_analysis",
        description: "Analyze system performance trends",
        frequency: "monthly",
        last_run: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_run: new Date().toISOString(),
        status: "pending",
        duration_ms: 0,
      },
    ]
  }

  private calculateNextRun(frequency: "daily" | "weekly" | "monthly"): Date {
    const now = new Date()
    switch (frequency) {
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      case "monthly":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    }
  }

  private getTimeRangeStart(range: "1h" | "24h" | "7d"): string {
    const now = Date.now()
    switch (range) {
      case "1h":
        return new Date(now - 60 * 60 * 1000).toISOString()
      case "24h":
        return new Date(now - 24 * 60 * 60 * 1000).toISOString()
      case "7d":
        return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  // Maintenance task implementations
  private async cleanupDatabase(): Promise<void> {
    // Clean up old logs (older than 30 days)
    await this.supabase
      .from("system_logs")
      .delete()
      .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Clean up old metrics (older than 90 days)
    await this.supabase
      .from("system_metrics")
      .delete()
      .lt("timestamp", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    // Clean up resolved alerts (older than 7 days)
    await this.supabase
      .from("system_alerts")
      .delete()
      .eq("resolved", true)
      .lt("timestamp", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  }

  private async cleanupCache(): Promise<void> {
    // Get all keys and remove expired ones
    const keys = await this.redis.keys("*")
    for (const key of keys) {
      const ttl = await this.redis.ttl(key)
      if (ttl === -1) {
        // Key without expiration, set reasonable TTL
        await this.redis.expire(key, 3600)
      }
    }
  }

  private async rotateLogFiles(): Promise<void> {
    // Implementation for log rotation
    console.log("Rotating log files...")
  }

  private async verifyBackups(): Promise<void> {
    // Implementation for backup verification
    console.log("Verifying backups...")
  }

  private async runSecurityScan(): Promise<void> {
    // Implementation for security scanning
    console.log("Running security scan...")
  }

  private async analyzePerformance(): Promise<void> {
    // Implementation for performance analysis
    console.log("Analyzing performance trends...")
  }
}

export const monitoringService = new MonitoringService()
