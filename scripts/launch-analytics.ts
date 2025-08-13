import { analytics } from "@/lib/analytics-service"

interface LaunchMetrics {
  timestamp: string
  activeUsers: number
  pageViews: number
  conversionRate: number
  revenue: number
  errorRate: number
  averageResponseTime: number
  customerSatisfaction: number
}

interface LaunchAnalysis {
  period: string
  totalUsers: number
  totalRevenue: number
  topPages: Array<{ page: string; views: number }>
  conversionFunnel: Array<{ step: string; users: number; dropoffRate: number }>
  performanceIssues: Array<{ issue: string; severity: "low" | "medium" | "high"; count: number }>
  recommendations: string[]
}

class LaunchAnalyticsService {
  private metrics: LaunchMetrics[] = []
  private startTime: Date

  constructor() {
    this.startTime = new Date()
    this.initializeTracking()
  }

  private initializeTracking() {
    setInterval(() => {
      this.collectRealTimeMetrics()
    }, 30000) // Collect every 30 seconds

    // Track critical launch events
    this.trackLaunchEvent("system_launch", "launch", "production_go_live")
  }

  private async collectRealTimeMetrics() {
    try {
      const metrics: LaunchMetrics = {
        timestamp: new Date().toISOString(),
        activeUsers: await this.getActiveUsers(),
        pageViews: await this.getPageViews(),
        conversionRate: await this.getConversionRate(),
        revenue: await this.getRevenue(),
        errorRate: await this.getErrorRate(),
        averageResponseTime: await this.getAverageResponseTime(),
        customerSatisfaction: await this.getCustomerSatisfaction(),
      }

      this.metrics.push(metrics)

      // Store in database
      await this.storeMetrics(metrics)

      // Check for alerts
      await this.checkAlerts(metrics)

      // Send to stakeholders if significant changes
      await this.checkSignificantChanges(metrics)
    } catch (error) {
      console.error("Error collecting launch metrics:", error)
      analytics.trackError(error as Error, { context: "launch_analytics" })
    }
  }

  private async getActiveUsers(): Promise<number> {
    const response = await fetch("/api/analytics/active-users")
    const data = await response.json()
    return data.activeUsers || 0
  }

  private async getPageViews(): Promise<number> {
    const response = await fetch("/api/analytics/page-views?period=1h")
    const data = await response.json()
    return data.pageViews || 0
  }

  private async getConversionRate(): Promise<number> {
    const response = await fetch("/api/analytics/conversion-rate?period=1h")
    const data = await response.json()
    return data.conversionRate || 0
  }

  private async getRevenue(): Promise<number> {
    const response = await fetch("/api/analytics/revenue?period=1h")
    const data = await response.json()
    return data.revenue || 0
  }

  private async getErrorRate(): Promise<number> {
    const response = await fetch("/api/monitoring/error-rate?period=1h")
    const data = await response.json()
    return data.errorRate || 0
  }

  private async getAverageResponseTime(): Promise<number> {
    const response = await fetch("/api/monitoring/response-time?period=1h")
    const data = await response.json()
    return data.averageResponseTime || 0
  }

  private async getCustomerSatisfaction(): Promise<number> {
    const response = await fetch("/api/feedback/satisfaction-score?period=1h")
    const data = await response.json()
    return data.satisfactionScore || 0
  }

  private async storeMetrics(metrics: LaunchMetrics) {
    await fetch("/api/analytics/launch-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metrics),
    })
  }

  private async checkAlerts(metrics: LaunchMetrics) {
    const alerts = []

    if (metrics.errorRate > 5) {
      alerts.push({
        type: "critical",
        message: `High error rate detected: ${metrics.errorRate}%`,
        metric: "error_rate",
        value: metrics.errorRate,
      })
    }

    if (metrics.averageResponseTime > 2000) {
      alerts.push({
        type: "warning",
        message: `Slow response time: ${metrics.averageResponseTime}ms`,
        metric: "response_time",
        value: metrics.averageResponseTime,
      })
    }

    if (metrics.conversionRate < 2) {
      alerts.push({
        type: "warning",
        message: `Low conversion rate: ${metrics.conversionRate}%`,
        metric: "conversion_rate",
        value: metrics.conversionRate,
      })
    }

    if (metrics.customerSatisfaction < 4.0) {
      alerts.push({
        type: "warning",
        message: `Low customer satisfaction: ${metrics.customerSatisfaction}/5.0`,
        metric: "customer_satisfaction",
        value: metrics.customerSatisfaction,
      })
    }

    // Send alerts if any
    if (alerts.length > 0) {
      await this.sendAlerts(alerts)
    }
  }

  private async checkSignificantChanges(currentMetrics: LaunchMetrics) {
    if (this.metrics.length < 2) return

    const previousMetrics = this.metrics[this.metrics.length - 2]
    const significantChanges = []

    const userChange = ((currentMetrics.activeUsers - previousMetrics.activeUsers) / previousMetrics.activeUsers) * 100
    if (Math.abs(userChange) > 20) {
      significantChanges.push({
        metric: "Active Users",
        change: userChange,
        current: currentMetrics.activeUsers,
        previous: previousMetrics.activeUsers,
      })
    }

    const revenueChange = ((currentMetrics.revenue - previousMetrics.revenue) / previousMetrics.revenue) * 100
    if (Math.abs(revenueChange) > 15) {
      significantChanges.push({
        metric: "Revenue",
        change: revenueChange,
        current: currentMetrics.revenue,
        previous: previousMetrics.revenue,
      })
    }

    if (significantChanges.length > 0) {
      await this.notifyStakeholders(significantChanges)
    }
  }

  private async sendAlerts(alerts: any[]) {
    await fetch("/api/alerts/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alerts, source: "launch_analytics" }),
    })
  }

  private async notifyStakeholders(changes: any[]) {
    await fetch("/api/notifications/stakeholders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "significant_change",
        changes,
        timestamp: new Date().toISOString(),
      }),
    })
  }

  public trackLaunchEvent(event: string, category: string, label?: string) {
    analytics.trackEvent(event, category, label, undefined, {
      launch_phase: "post_launch",
      timestamp: new Date().toISOString(),
    })
  }

  public async generateLaunchReport(hours = 24): Promise<LaunchAnalysis> {
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000)

    const periodMetrics = this.metrics.filter(
      (m) => new Date(m.timestamp) >= startTime && new Date(m.timestamp) <= endTime,
    )

    const analysis: LaunchAnalysis = {
      period: `${hours} hours post-launch`,
      totalUsers: Math.max(...periodMetrics.map((m) => m.activeUsers)),
      totalRevenue: periodMetrics.reduce((sum, m) => sum + m.revenue, 0),
      topPages: await this.getTopPages(hours),
      conversionFunnel: await this.getConversionFunnel(hours),
      performanceIssues: await this.getPerformanceIssues(hours),
      recommendations: this.generateRecommendations(periodMetrics),
    }

    return analysis
  }

  private async getTopPages(hours: number) {
    const response = await fetch(`/api/analytics/top-pages?hours=${hours}`)
    const data = await response.json()
    return data.topPages || []
  }

  private async getConversionFunnel(hours: number) {
    const response = await fetch(`/api/analytics/conversion-funnel?hours=${hours}`)
    const data = await response.json()
    return data.funnel || []
  }

  private async getPerformanceIssues(hours: number) {
    const response = await fetch(`/api/monitoring/issues?hours=${hours}`)
    const data = await response.json()
    return data.issues || []
  }

  private generateRecommendations(metrics: LaunchMetrics[]): string[] {
    const recommendations = []

    if (metrics.length === 0) return recommendations

    const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / metrics.length
    const avgConversionRate = metrics.reduce((sum, m) => sum + m.conversionRate, 0) / metrics.length

    if (avgErrorRate > 2) {
      recommendations.push("ปรับปรุงการจัดการข้อผิดพลาด - อัตราข้อผิดพลาดสูงกว่าเกณฑ์")
    }

    if (avgResponseTime > 1500) {
      recommendations.push("เพิ่มประสิทธิภาพระบบ - เวลาตอบสนองช้าเกินไป")
    }

    if (avgConversionRate < 3) {
      recommendations.push("ปรับปรุง UX และ checkout process - อัตราการแปลงต่ำ")
    }

    const userTrend = this.calculateTrend(metrics.map((m) => m.activeUsers))
    if (userTrend < -10) {
      recommendations.push("เพิ่มกิจกรรมการตลาดเพื่อดึงดูดผู้ใช้ - จำนวนผู้ใช้ลดลง")
    }

    if (recommendations.length === 0) {
      recommendations.push("ระบบทำงานได้ดี - ควรรักษาประสิทธิภาพปัจจุบัน")
    }

    return recommendations
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    const first = values[0]
    const last = values[values.length - 1]
    return ((last - first) / first) * 100
  }

  public getMetrics(): LaunchMetrics[] {
    return this.metrics
  }

  public async exportReport(format: "json" | "csv" = "json") {
    const report = await this.generateLaunchReport(24)

    if (format === "csv") {
      return this.convertToCSV(report)
    }

    return JSON.stringify(report, null, 2)
  }

  private convertToCSV(report: LaunchAnalysis): string {
    const headers = ["Metric", "Value", "Period"]
    const rows = [
      ["Total Users", report.totalUsers.toString(), report.period],
      ["Total Revenue", report.totalRevenue.toString(), report.period],
      ["Top Page", report.topPages[0]?.page || "N/A", report.period],
      ["Performance Issues", report.performanceIssues.length.toString(), report.period],
    ]

    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  }
}

export const launchAnalytics = new LaunchAnalyticsService()
export default launchAnalytics
