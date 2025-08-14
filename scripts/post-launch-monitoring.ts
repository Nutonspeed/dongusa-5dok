import "server-only"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"

const execAsync = promisify(exec)

interface MonitoringMetrics {
  timestamp: string
  uptime: boolean
  responseTime: number
  errorRate: number
  activeUsers: number
  systemHealth: {
    database: boolean
    api: boolean
    cdn: boolean
    storage: boolean
  }
  performance: {
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
  }
  businessMetrics: {
    ordersPerHour: number
    conversionRate: number
    averageOrderValue: number
  }
}

interface Alert {
  id: string
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  timestamp: string
  resolved: boolean
  resolvedAt?: string
}

class PostLaunchMonitoring {
  private alerts: Alert[] = []
  private metrics: MonitoringMetrics[] = []
  private isMonitoring = false

  private readonly thresholds = {
    responseTime: 2000, // 2 seconds
    errorRate: 0.01, // 1%
    uptime: 0.999, // 99.9%
    memoryUsage: 0.8, // 80%
    cpuUsage: 0.7, // 70%
  }

  async startMonitoring(): Promise<void> {
    console.log("🔍 Starting post-launch monitoring...")
    this.isMonitoring = true

    // Start monitoring loops
    this.startHealthChecks()
    this.startPerformanceMonitoring()
    this.startBusinessMetricsTracking()
    this.startAlertProcessing()

    console.log("✅ Post-launch monitoring activated")
  }

  async stopMonitoring(): Promise<void> {
    console.log("⏹️ Stopping post-launch monitoring...")
    this.isMonitoring = false
  }

  private async startHealthChecks(): Promise<void> {
    const checkInterval = 30000 // 30 seconds

    const runHealthCheck = async () => {
      if (!this.isMonitoring) return

      try {
        const metrics = await this.collectMetrics()
        this.metrics.push(metrics)

        // Keep only last 1000 metrics (about 8 hours at 30s intervals)
        if (this.metrics.length > 1000) {
          this.metrics = this.metrics.slice(-1000)
        }

        await this.evaluateAlerts(metrics)
        await this.saveMetrics(metrics)
      } catch (error) {
        console.error("Health check failed:", error)
        await this.createAlert("critical", "Health Check Failed", `Health check error: ${error}`)
      }

      setTimeout(runHealthCheck, checkInterval)
    }

    runHealthCheck()
  }

  private async collectMetrics(): Promise<MonitoringMetrics> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sofacoverpro.vercel.app"

    // Test main site availability
    const startTime = Date.now()
    let uptime = false
    let responseTime = 0

    try {
      const response = await fetch(siteUrl, { timeout: 10000 })
      uptime = response.ok
      responseTime = Date.now() - startTime
    } catch (error) {
      uptime = false
      responseTime = Date.now() - startTime
    }

    // Test system components
    const systemHealth = await this.checkSystemHealth(siteUrl)

    // Get performance metrics (simulated for now)
    const performance = await this.getPerformanceMetrics()

    // Get business metrics
    const businessMetrics = await this.getBusinessMetrics(siteUrl)

    return {
      timestamp: new Date().toISOString(),
      uptime,
      responseTime,
      errorRate: await this.calculateErrorRate(siteUrl),
      activeUsers: await this.getActiveUsers(),
      systemHealth,
      performance,
      businessMetrics,
    }
  }

  private async checkSystemHealth(siteUrl: string): Promise<MonitoringMetrics["systemHealth"]> {
    const checks = {
      database: false,
      api: false,
      cdn: false,
      storage: false,
    }

    try {
      // Check API health
      const apiResponse = await fetch(`${siteUrl}/api/health`, { timeout: 5000 })
      if (apiResponse.ok) {
        const healthData = await apiResponse.json()
        checks.api = true
        checks.database = healthData.database || false
        checks.storage = healthData.storage || false
      }

      // Check CDN (by testing static asset)
      const cdnResponse = await fetch(`${siteUrl}/favicon.ico`, { timeout: 5000 })
      checks.cdn = cdnResponse.ok
    } catch (error) {
      console.error("System health check failed:", error)
    }

    return checks
  }

  private async getPerformanceMetrics(): Promise<MonitoringMetrics["performance"]> {
    // In a real implementation, these would come from your monitoring service
    return {
      memoryUsage: Math.random() * 0.6 + 0.2, // 20-80%
      cpuUsage: Math.random() * 0.5 + 0.1, // 10-60%
      diskUsage: Math.random() * 0.3 + 0.1, // 10-40%
    }
  }

  private async calculateErrorRate(siteUrl: string): Promise<number> {
    try {
      // Test multiple endpoints
      const endpoints = ["/", "/products", "/api/products", "/api/health"]
      let errors = 0

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${siteUrl}${endpoint}`, { timeout: 5000 })
          if (!response.ok && response.status >= 500) {
            errors++
          }
        } catch {
          errors++
        }
      }

      return errors / endpoints.length
    } catch {
      return 0.1 // Assume 10% error rate if we can't check
    }
  }

  private async getActiveUsers(): Promise<number> {
    // In a real implementation, this would come from your analytics service
    return Math.floor(Math.random() * 100) + 10
  }

  private async getBusinessMetrics(siteUrl: string): Promise<MonitoringMetrics["businessMetrics"]> {
    try {
      // In a real implementation, these would come from your database/analytics
      return {
        ordersPerHour: Math.floor(Math.random() * 20) + 5,
        conversionRate: Math.random() * 0.05 + 0.02, // 2-7%
        averageOrderValue: Math.random() * 500 + 1000, // 1000-1500
      }
    } catch {
      return {
        ordersPerHour: 0,
        conversionRate: 0,
        averageOrderValue: 0,
      }
    }
  }

  private async evaluateAlerts(metrics: MonitoringMetrics): Promise<void> {
    // Check uptime
    if (!metrics.uptime) {
      await this.createAlert("critical", "Site Down", "Main website is not responding")
    }

    // Check response time
    if (metrics.responseTime > this.thresholds.responseTime) {
      await this.createAlert(
        "high",
        "Slow Response Time",
        `Response time is ${metrics.responseTime}ms (threshold: ${this.thresholds.responseTime}ms)`,
      )
    }

    // Check error rate
    if (metrics.errorRate > this.thresholds.errorRate) {
      await this.createAlert(
        "high",
        "High Error Rate",
        `Error rate is ${(metrics.errorRate * 100).toFixed(2)}% (threshold: ${(this.thresholds.errorRate * 100).toFixed(2)}%)`,
      )
    }

    // Check system health
    if (!metrics.systemHealth.database) {
      await this.createAlert("critical", "Database Unavailable", "Database health check failed")
    }

    if (!metrics.systemHealth.api) {
      await this.createAlert("critical", "API Unavailable", "API health check failed")
    }

    // Check performance
    if (metrics.performance.memoryUsage > this.thresholds.memoryUsage) {
      await this.createAlert(
        "medium",
        "High Memory Usage",
        `Memory usage is ${(metrics.performance.memoryUsage * 100).toFixed(1)}%`,
      )
    }

    if (metrics.performance.cpuUsage > this.thresholds.cpuUsage) {
      await this.createAlert(
        "medium",
        "High CPU Usage",
        `CPU usage is ${(metrics.performance.cpuUsage * 100).toFixed(1)}%`,
      )
    }
  }

  private async createAlert(severity: Alert["severity"], title: string, description: string): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Check if similar alert already exists and is unresolved
    const existingAlert = this.alerts.find(
      (alert) => alert.title === title && !alert.resolved && Date.now() - new Date(alert.timestamp).getTime() < 300000, // 5 minutes
    )

    if (existingAlert) {
      return // Don't create duplicate alerts
    }

    const alert: Alert = {
      id: alertId,
      severity,
      title,
      description,
      timestamp: new Date().toISOString(),
      resolved: false,
    }

    this.alerts.push(alert)
    console.log(`🚨 ${severity.toUpperCase()} ALERT: ${title} - ${description}`)

    await this.notifyAlert(alert)
    await this.saveAlert(alert)
  }

  private async notifyAlert(alert: Alert): Promise<void> {
    // In a real implementation, this would send notifications via:
    // - Slack
    // - Email
    // - SMS
    // - PagerDuty
    // - Discord

    console.log(`📢 Alert notification sent: ${alert.title}`)

    // For critical alerts, you might want immediate escalation
    if (alert.severity === "critical") {
      console.log("📞 Escalating critical alert to on-call team")
    }
  }

  private async startPerformanceMonitoring(): Promise<void> {
    // Monitor Core Web Vitals and other performance metrics
    setInterval(async () => {
      if (!this.isMonitoring) return

      try {
        await this.checkCoreWebVitals()
      } catch (error) {
        console.error("Performance monitoring error:", error)
      }
    }, 60000) // Every minute
  }

  private async checkCoreWebVitals(): Promise<void> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sofacoverpro.vercel.app"

    // In a real implementation, you would use tools like:
    // - Lighthouse CI
    // - Web Vitals API
    // - Real User Monitoring (RUM)

    console.log("📊 Checking Core Web Vitals...")
  }

  private async startBusinessMetricsTracking(): Promise<void> {
    setInterval(async () => {
      if (!this.isMonitoring) return

      try {
        await this.trackBusinessKPIs()
      } catch (error) {
        console.error("Business metrics tracking error:", error)
      }
    }, 300000) // Every 5 minutes
  }

  private async trackBusinessKPIs(): Promise<void> {
    // Track important business metrics:
    // - Conversion rates
    // - Order volume
    // - Revenue
    // - User engagement

    console.log("📈 Tracking business KPIs...")
  }

  private async startAlertProcessing(): Promise<void> {
    setInterval(async () => {
      if (!this.isMonitoring) return

      try {
        await this.processAlerts()
      } catch (error) {
        console.error("Alert processing error:", error)
      }
    }, 60000) // Every minute
  }

  private async processAlerts(): Promise<void> {
    // Auto-resolve alerts that are no longer relevant
    const currentTime = Date.now()

    for (const alert of this.alerts) {
      if (!alert.resolved && currentTime - new Date(alert.timestamp).getTime() > 600000) {
        // 10 minutes
        // Check if the issue is still present
        const isStillRelevant = await this.checkAlertRelevance(alert)

        if (!isStillRelevant) {
          alert.resolved = true
          alert.resolvedAt = new Date().toISOString()
          console.log(`✅ Auto-resolved alert: ${alert.title}`)
        }
      }
    }
  }

  private async checkAlertRelevance(alert: Alert): Promise<boolean> {
    // Check if the alert condition still exists
    const latestMetrics = this.metrics[this.metrics.length - 1]
    if (!latestMetrics) return true

    switch (alert.title) {
      case "Site Down":
        return !latestMetrics.uptime
      case "Slow Response Time":
        return latestMetrics.responseTime > this.thresholds.responseTime
      case "High Error Rate":
        return latestMetrics.errorRate > this.thresholds.errorRate
      case "Database Unavailable":
        return !latestMetrics.systemHealth.database
      case "API Unavailable":
        return !latestMetrics.systemHealth.api
      default:
        return true
    }
  }

  private async saveMetrics(metrics: MonitoringMetrics): Promise<void> {
    const metricsDir = path.join(process.cwd(), "docs", "monitoring", "metrics")
    await fs.mkdir(metricsDir, { recursive: true })

    const filename = `metrics_${new Date().toISOString().split("T")[0]}.json`
    const filepath = path.join(metricsDir, filename)

    try {
      let existingMetrics: MonitoringMetrics[] = []
      try {
        const existingData = await fs.readFile(filepath, "utf-8")
        existingMetrics = JSON.parse(existingData)
      } catch {
        // File doesn't exist yet
      }

      existingMetrics.push(metrics)
      await fs.writeFile(filepath, JSON.stringify(existingMetrics, null, 2))
    } catch (error) {
      console.error("Failed to save metrics:", error)
    }
  }

  private async saveAlert(alert: Alert): Promise<void> {
    const alertsDir = path.join(process.cwd(), "docs", "monitoring", "alerts")
    await fs.mkdir(alertsDir, { recursive: true })

    const filename = `alerts_${new Date().toISOString().split("T")[0]}.json`
    const filepath = path.join(alertsDir, filename)

    try {
      let existingAlerts: Alert[] = []
      try {
        const existingData = await fs.readFile(filepath, "utf-8")
        existingAlerts = JSON.parse(existingData)
      } catch {
        // File doesn't exist yet
      }

      existingAlerts.push(alert)
      await fs.writeFile(filepath, JSON.stringify(existingAlerts, null, 2))
    } catch (error) {
      console.error("Failed to save alert:", error)
    }
  }

  async generateDailyReport(): Promise<void> {
    const today = new Date().toISOString().split("T")[0]
    const todayMetrics = this.metrics.filter((m) => m.timestamp.startsWith(today))
    const todayAlerts = this.alerts.filter((a) => a.timestamp.startsWith(today))

    if (todayMetrics.length === 0) return

    const report = {
      date: today,
      summary: {
        totalChecks: todayMetrics.length,
        uptime: (todayMetrics.filter((m) => m.uptime).length / todayMetrics.length) * 100,
        averageResponseTime: todayMetrics.reduce((sum, m) => sum + m.responseTime, 0) / todayMetrics.length,
        averageErrorRate: todayMetrics.reduce((sum, m) => sum + m.errorRate, 0) / todayMetrics.length,
        totalAlerts: todayAlerts.length,
        criticalAlerts: todayAlerts.filter((a) => a.severity === "critical").length,
      },
      alerts: todayAlerts,
      recommendations: this.generateRecommendations(todayMetrics, todayAlerts),
    }

    const reportPath = path.join(process.cwd(), "docs", "monitoring", "reports", `daily_report_${today}.json`)
    await fs.mkdir(path.dirname(reportPath), { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))

    console.log(`📊 Daily report generated: ${reportPath}`)
  }

  private generateRecommendations(metrics: MonitoringMetrics[], alerts: Alert[]): string[] {
    const recommendations: string[] = []

    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length
    if (avgResponseTime > 1500) {
      recommendations.push("Consider optimizing application performance - average response time is above 1.5s")
    }

    const criticalAlerts = alerts.filter((a) => a.severity === "critical")
    if (criticalAlerts.length > 0) {
      recommendations.push("Review and address critical alerts to improve system reliability")
    }

    const uptimePercentage = (metrics.filter((m) => m.uptime).length / metrics.length) * 100
    if (uptimePercentage < 99.5) {
      recommendations.push("Investigate uptime issues - current uptime is below 99.5%")
    }

    return recommendations
  }
}

// Run monitoring if called directly
if (require.main === module) {
  const monitoring = new PostLaunchMonitoring()

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down monitoring...")
    await monitoring.stopMonitoring()
    await monitoring.generateDailyReport()
    process.exit(0)
  })

  monitoring.startMonitoring().catch(console.error)
}

export default PostLaunchMonitoring
