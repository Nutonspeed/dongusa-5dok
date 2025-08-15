import { createClient } from "@supabase/supabase-js"
import { cacheService } from "./performance/cache-service"

interface UsageThresholds {
  storage: {
    warning: number // 80% of limit
    critical: number // 90% of limit
    limit: number // 500 MB
  }
  bandwidth: {
    warning: number // 80% of limit
    critical: number // 90% of limit
    limit: number // 5000 MB/month
  }
  apiRequests: {
    warning: number // requests/hour
    critical: number // requests/hour
  }
}

interface UsageAlert {
  id: string
  type: "storage" | "bandwidth" | "api_requests"
  severity: "warning" | "critical"
  message: string
  currentValue: number
  threshold: number
  timestamp: string
  resolved: boolean
}

interface UsageMetrics {
  storage: {
    used: number
    percentage: number
    trend: "increasing" | "decreasing" | "stable"
  }
  bandwidth: {
    used: number
    percentage: number
    dailyAverage: number
    projectedMonthly: number
  }
  apiRequests: {
    hourly: number
    daily: number
    trend: "increasing" | "decreasing" | "stable"
  }
  alerts: UsageAlert[]
  lastUpdated: string
}

export class SupabaseUsageMonitor {
  private supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  private thresholds: UsageThresholds = {
    storage: {
      warning: 400, // 80% of 500MB
      critical: 450, // 90% of 500MB
      limit: 500,
    },
    bandwidth: {
      warning: 4000, // 80% of 5GB
      critical: 4500, // 90% of 5GB
      limit: 5000,
    },
    apiRequests: {
      warning: 1000, // requests/hour
      critical: 2000, // requests/hour
    },
  }

  private alerts: UsageAlert[] = []

  async startMonitoring(): Promise<void> {
    // Monitor every 5 minutes
    setInterval(
      async () => {
        await this.collectMetrics()
      },
      5 * 60 * 1000,
    )

    // Generate daily reports
    setInterval(
      async () => {
        await this.generateDailyReport()
      },
      24 * 60 * 60 * 1000,
    )

    // Initial collection
    await this.collectMetrics()
  }

  async collectMetrics(): Promise<UsageMetrics> {
    const storageMetrics = await this.getStorageMetrics()
    const bandwidthMetrics = await this.getBandwidthMetrics()
    const apiMetrics = await this.getApiMetrics()

    // Check for threshold violations
    await this.checkThresholds(storageMetrics, bandwidthMetrics, apiMetrics)

    const metrics: UsageMetrics = {
      storage: storageMetrics,
      bandwidth: bandwidthMetrics,
      apiRequests: apiMetrics,
      alerts: this.alerts.filter((alert) => !alert.resolved),
      lastUpdated: new Date().toISOString(),
    }

    // Cache metrics for dashboard
    cacheService.set("supabase_usage_metrics", metrics, 300) // 5 minutes

    return metrics
  }

  private async getStorageMetrics() {
    const tables = ["categories", "fabric_collections", "fabrics", "products", "orders", "order_items", "profiles"]
    let totalEstimatedMB = 0

    for (const table of tables) {
      const { count } = await this.supabase.from(table).select("*", { count: "exact", head: true })
      const estimatedRowSize = this.estimateRowSize(table)
      const tableSizeMB = ((count || 0) * estimatedRowSize) / (1024 * 1024)
      totalEstimatedMB += tableSizeMB
    }

    // Get historical data for trend analysis
    const previousMetrics = cacheService.get("storage_history") || []
    const currentTime = Date.now()
    previousMetrics.push({ value: totalEstimatedMB, timestamp: currentTime })

    // Keep only last 24 hours of data
    const oneDayAgo = currentTime - 24 * 60 * 60 * 1000
    const recentMetrics = previousMetrics.filter((m: any) => m.timestamp > oneDayAgo)
    cacheService.set("storage_history", recentMetrics, 86400) // 24 hours

    const trend = this.calculateTrend(recentMetrics)

    return {
      used: Math.round(totalEstimatedMB * 100) / 100,
      percentage: Math.round((totalEstimatedMB / this.thresholds.storage.limit) * 100 * 100) / 100,
      trend,
    }
  }

  private async getBandwidthMetrics() {
    // Estimate bandwidth based on recent activity
    const { data: recentOrders } = await this.supabase
      .from("orders")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const { data: recentProducts } = await this.supabase
      .from("products")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // Estimate bandwidth usage
    const dailyOrders = recentOrders?.length || 0
    const dailyProductViews = (recentProducts?.length || 0) * 10 // Assume 10 views per product

    // Each order involves ~2MB of data transfer, each product view ~0.5MB
    const dailyBandwidthMB = dailyOrders * 2 + dailyProductViews * 0.5
    const projectedMonthly = dailyBandwidthMB * 30

    return {
      used: Math.round(dailyBandwidthMB * 100) / 100,
      percentage: Math.round((projectedMonthly / this.thresholds.bandwidth.limit) * 100 * 100) / 100,
      dailyAverage: Math.round(dailyBandwidthMB * 100) / 100,
      projectedMonthly: Math.round(projectedMonthly * 100) / 100,
    }
  }

  private async getApiMetrics() {
    // Get API request metrics from cache or estimate
    const cachedRequests = cacheService.get("api_request_count") || 0
    const hourlyRequests = cachedRequests
    const dailyRequests = hourlyRequests * 24

    // Get historical data for trend analysis
    const previousMetrics = cacheService.get("api_history") || []
    const currentTime = Date.now()
    previousMetrics.push({ value: hourlyRequests, timestamp: currentTime })

    // Keep only last 24 hours of data
    const oneDayAgo = currentTime - 24 * 60 * 60 * 1000
    const recentMetrics = previousMetrics.filter((m: any) => m.timestamp > oneDayAgo)
    cacheService.set("api_history", recentMetrics, 86400) // 24 hours

    const trend = this.calculateTrend(recentMetrics)

    return {
      hourly: hourlyRequests,
      daily: dailyRequests,
      trend,
    }
  }

  private calculateTrend(metrics: any[]): "increasing" | "decreasing" | "stable" {
    if (metrics.length < 2) return "stable"

    const recent = metrics.slice(-6) // Last 6 data points
    const older = metrics.slice(-12, -6) // Previous 6 data points

    if (recent.length === 0 || older.length === 0) return "stable"

    const recentAvg = recent.reduce((sum: number, m: any) => sum + m.value, 0) / recent.length
    const olderAvg = older.reduce((sum: number, m: any) => sum + m.value, 0) / older.length

    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100

    if (changePercent > 5) return "increasing"
    if (changePercent < -5) return "decreasing"
    return "stable"
  }

  private estimateRowSize(table: string): number {
    const estimates: Record<string, number> = {
      categories: 500,
      fabric_collections: 600,
      fabrics: 800,
      products: 1200,
      orders: 2000,
      order_items: 300,
      profiles: 400,
    }
    return estimates[table] || 500
  }

  private async checkThresholds(storageMetrics: any, bandwidthMetrics: any, apiMetrics: any) {
    // Check storage thresholds
    if (storageMetrics.used >= this.thresholds.storage.critical) {
      await this.createAlert("storage", "critical", storageMetrics.used, this.thresholds.storage.critical)
    } else if (storageMetrics.used >= this.thresholds.storage.warning) {
      await this.createAlert("storage", "warning", storageMetrics.used, this.thresholds.storage.warning)
    }

    // Check bandwidth thresholds
    if (bandwidthMetrics.projectedMonthly >= this.thresholds.bandwidth.critical) {
      await this.createAlert(
        "bandwidth",
        "critical",
        bandwidthMetrics.projectedMonthly,
        this.thresholds.bandwidth.critical,
      )
    } else if (bandwidthMetrics.projectedMonthly >= this.thresholds.bandwidth.warning) {
      await this.createAlert(
        "bandwidth",
        "warning",
        bandwidthMetrics.projectedMonthly,
        this.thresholds.bandwidth.warning,
      )
    }

    // Check API request thresholds
    if (apiMetrics.hourly >= this.thresholds.apiRequests.critical) {
      await this.createAlert("api_requests", "critical", apiMetrics.hourly, this.thresholds.apiRequests.critical)
    } else if (apiMetrics.hourly >= this.thresholds.apiRequests.warning) {
      await this.createAlert("api_requests", "warning", apiMetrics.hourly, this.thresholds.apiRequests.warning)
    }
  }

  private async createAlert(
    type: "storage" | "bandwidth" | "api_requests",
    severity: "warning" | "critical",
    currentValue: number,
    threshold: number,
  ) {
    const alertId = `${type}_${severity}_${Date.now()}`

    // Check if similar alert already exists
    const existingAlert = this.alerts.find(
      (alert) => alert.type === type && alert.severity === severity && !alert.resolved,
    )

    if (existingAlert) {
      // Update existing alert
      existingAlert.currentValue = currentValue
      existingAlert.timestamp = new Date().toISOString()
      return
    }

    const messages = {
      storage: {
        warning: `Database storage usage is at ${currentValue.toFixed(1)}MB (${((currentValue / this.thresholds.storage.limit) * 100).toFixed(1)}% of limit)`,
        critical: `CRITICAL: Database storage usage is at ${currentValue.toFixed(1)}MB (${((currentValue / this.thresholds.storage.limit) * 100).toFixed(1)}% of limit)`,
      },
      bandwidth: {
        warning: `Projected monthly bandwidth usage is ${currentValue.toFixed(1)}MB (${((currentValue / this.thresholds.bandwidth.limit) * 100).toFixed(1)}% of limit)`,
        critical: `CRITICAL: Projected monthly bandwidth usage is ${currentValue.toFixed(1)}MB (${((currentValue / this.thresholds.bandwidth.limit) * 100).toFixed(1)}% of limit)`,
      },
      api_requests: {
        warning: `API requests are at ${currentValue}/hour (approaching high usage)`,
        critical: `CRITICAL: API requests are at ${currentValue}/hour (very high usage detected)`,
      },
    }

    const alert: UsageAlert = {
      id: alertId,
      type,
      severity,
      message: messages[type][severity],
      currentValue,
      threshold,
      timestamp: new Date().toISOString(),
      resolved: false,
    }

    this.alerts.push(alert)

    // Send notification
    await this.sendAlert(alert)
  }

  private async sendAlert(alert: UsageAlert) {
    try {
      // Send to notification system
      await fetch("/api/notifications/usage-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      })

      // Log to console for development
      console.warn(`Supabase Usage Alert [${alert.severity.toUpperCase()}]:`, alert.message)
    } catch (error) {
      console.error("Failed to send usage alert:", error)
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.resolved = true
    }
  }

  async getUsageReport(): Promise<string> {
    const metrics = await this.collectMetrics()

    return `
# Supabase Free Plan Usage Report

## Current Usage Status

### Database Storage
- **Used**: ${metrics.storage.used} MB / ${this.thresholds.storage.limit} MB
- **Percentage**: ${metrics.storage.percentage}%
- **Trend**: ${metrics.storage.trend}
- **Status**: ${metrics.storage.percentage > 90 ? "🔴 Critical" : metrics.storage.percentage > 80 ? "🟡 Warning" : "🟢 Normal"}

### Bandwidth Usage
- **Daily Average**: ${metrics.bandwidth.dailyAverage} MB
- **Monthly Projection**: ${metrics.bandwidth.projectedMonthly} MB / ${this.thresholds.bandwidth.limit} MB
- **Percentage**: ${metrics.bandwidth.percentage}%
- **Status**: ${metrics.bandwidth.percentage > 90 ? "🔴 Critical" : metrics.bandwidth.percentage > 80 ? "🟡 Warning" : "🟢 Normal"}

### API Requests
- **Hourly**: ${metrics.apiRequests.hourly} requests
- **Daily**: ${metrics.apiRequests.daily} requests
- **Trend**: ${metrics.apiRequests.trend}
- **Status**: ${metrics.apiRequests.hourly > this.thresholds.apiRequests.critical ? "🔴 Critical" : metrics.apiRequests.hourly > this.thresholds.apiRequests.warning ? "🟡 Warning" : "🟢 Normal"}

## Active Alerts
${metrics.alerts.length === 0 ? "No active alerts" : metrics.alerts.map((alert) => `- [${alert.severity.toUpperCase()}] ${alert.message}`).join("\n")}

## Recommendations
${this.generateRecommendations(metrics)
  .map((rec) => `- ${rec}`)
  .join("\n")}

---
*Report generated at: ${metrics.lastUpdated}*
    `.trim()
  }

  private generateRecommendations(metrics: UsageMetrics): string[] {
    const recommendations = []

    if (metrics.storage.percentage > 80) {
      recommendations.push("Consider implementing data archiving or cleanup procedures")
      recommendations.push("Optimize image storage and compression")
    }

    if (metrics.bandwidth.percentage > 80) {
      recommendations.push("Implement more aggressive caching strategies")
      recommendations.push("Optimize image sizes and formats (WebP)")
      recommendations.push("Consider using a CDN for static assets")
    }

    if (metrics.apiRequests.hourly > this.thresholds.apiRequests.warning) {
      recommendations.push("Implement request batching and caching")
      recommendations.push("Review and optimize database queries")
      recommendations.push("Consider implementing rate limiting")
    }

    if (
      metrics.storage.trend === "increasing" ||
      metrics.bandwidth.projectedMonthly > this.thresholds.bandwidth.warning
    ) {
      recommendations.push("Plan for Supabase Pro upgrade when approaching limits")
    }

    return recommendations
  }

  async generateDailyReport(): Promise<void> {
    const report = await this.getUsageReport()

    // Store daily report
    cacheService.set(`daily_report_${new Date().toISOString().split("T")[0]}`, report, 86400 * 7) // Keep for 7 days

    // Send to admin if there are critical alerts
    const metrics = await this.collectMetrics()
    const criticalAlerts = metrics.alerts.filter((alert) => alert.severity === "critical")

    if (criticalAlerts.length > 0) {
      await fetch("/api/notifications/daily-usage-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, criticalAlerts }),
      })
    }
  }

  // Public methods for dashboard
  async getCurrentMetrics(): Promise<UsageMetrics> {
    const cached = cacheService.get("supabase_usage_metrics")
    if (cached) return cached

    return await this.collectMetrics()
  }

  async getUsageHistory(days = 7): Promise<any[]> {
    const history = []
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      const report = cacheService.get(`daily_report_${date}`)
      if (report) {
        history.push({ date, report })
      }
    }
    return history.reverse()
  }
}

export const usageMonitor = new SupabaseUsageMonitor()
