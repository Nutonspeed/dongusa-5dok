import { createClient } from "@supabase/supabase-js"

interface UsageAnalysis {
  databaseSize: {
    estimatedMB: number
    tableBreakdown: Record<string, number>
    percentageUsed: number
  }
  bandwidthUsage: {
    estimatedMB: number
    dailyAverage: number
    monthlyProjection: number
  }
  apiRequests: {
    dailyAverage: number
    peakHours: string[]
    heaviestOperations: string[]
  }
  recommendations: string[]
  alerts: string[]
}

export class SupabaseUsageAnalyzer {
  private supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  async analyzeCurrentUsage(): Promise<UsageAnalysis> {
    const analysis: UsageAnalysis = {
      databaseSize: await this.analyzeDatabaseSize(),
      bandwidthUsage: await this.analyzeBandwidthUsage(),
      apiRequests: await this.analyzeApiRequests(),
      recommendations: [],
      alerts: [],
    }

    // Generate recommendations based on analysis
    analysis.recommendations = this.generateRecommendations(analysis)
    analysis.alerts = this.generateAlerts(analysis)

    return analysis
  }

  private async analyzeDatabaseSize() {
    const tables = ["categories", "fabric_collections", "fabrics", "products", "orders", "order_items", "profiles"]
    const tableBreakdown: Record<string, number> = {}
    let totalEstimatedMB = 0

    for (const table of tables) {
      const { count } = await this.supabase.from(table).select("*", { count: "exact", head: true })

      // Estimate size based on table structure and row count
      const estimatedRowSize = this.estimateRowSize(table)
      const tableSizeMB = ((count || 0) * estimatedRowSize) / (1024 * 1024)

      tableBreakdown[table] = tableSizeMB
      totalEstimatedMB += tableSizeMB
    }

    return {
      estimatedMB: Math.round(totalEstimatedMB * 100) / 100,
      tableBreakdown,
      percentageUsed: Math.round((totalEstimatedMB / 500) * 100 * 100) / 100,
    }
  }

  private estimateRowSize(table: string): number {
    // Rough estimates based on table structure
    const estimates: Record<string, number> = {
      categories: 500, // UUID + text fields + image URL
      fabric_collections: 600,
      fabrics: 800, // More fields including price
      products: 1200, // Images array + multiple text fields
      orders: 2000, // JSONB addresses + multiple fields
      order_items: 300,
      profiles: 400,
    }
    return estimates[table] || 500
  }

  private async analyzeBandwidthUsage() {
    // Since we can't get actual bandwidth metrics from free plan,
    // we'll estimate based on typical usage patterns
    const { data: recentOrders } = await this.supabase
      .from("orders")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const dailyOrders = (recentOrders?.length || 0) / 7

    // Estimate bandwidth: each order involves multiple API calls + image loading
    const estimatedDailyMB = dailyOrders * 2 + 10 // Base usage + order processing
    const monthlyProjection = estimatedDailyMB * 30

    return {
      estimatedMB: Math.round(estimatedDailyMB * 100) / 100,
      dailyAverage: Math.round(estimatedDailyMB * 100) / 100,
      monthlyProjection: Math.round(monthlyProjection * 100) / 100,
    }
  }

  private async analyzeApiRequests() {
    // Estimate API usage based on data patterns
    const { data: recentActivity } = await this.supabase
      .from("orders")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const dailyOrders = recentActivity?.length || 0

    // Estimate: each page load = 5-10 requests, each order = 15-20 requests
    const estimatedDailyRequests = dailyOrders * 20 + 500 // Base traffic

    return {
      dailyAverage: estimatedDailyRequests,
      peakHours: ["10:00-12:00", "14:00-16:00", "19:00-21:00"],
      heaviestOperations: ["Product listing", "Order processing", "Image loading"],
    }
  }

  private generateRecommendations(analysis: UsageAnalysis): string[] {
    const recommendations: string[] = []

    if (analysis.databaseSize.percentageUsed > 70) {
      recommendations.push("Database usage is high. Consider data archiving or cleanup.")
    }

    if (analysis.bandwidthUsage.monthlyProjection > 4000) {
      recommendations.push("Bandwidth usage approaching limit. Optimize image sizes and implement caching.")
    }

    if (analysis.apiRequests.dailyAverage > 10000) {
      recommendations.push("High API usage detected. Implement request batching and caching.")
    }

    // Always include optimization recommendations
    recommendations.push("Implement image optimization and lazy loading")
    recommendations.push("Use database indexes for better query performance")
    recommendations.push("Consider implementing client-side caching")

    return recommendations
  }

  private generateAlerts(analysis: UsageAnalysis): string[] {
    const alerts: string[] = []

    if (analysis.databaseSize.percentageUsed > 80) {
      alerts.push("CRITICAL: Database storage usage above 80%")
    }

    if (analysis.bandwidthUsage.monthlyProjection > 4500) {
      alerts.push("WARNING: Bandwidth usage may exceed free tier limit")
    }

    return alerts
  }

  async generateUsageReport(): Promise<string> {
    const analysis = await this.analyzeCurrentUsage()

    return `
# Supabase Free Plan Usage Analysis

## Database Storage
- Current Usage: ${analysis.databaseSize.estimatedMB} MB / 500 MB (${analysis.databaseSize.percentageUsed}%)
- Largest Tables: ${Object.entries(analysis.databaseSize.tableBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([table, size]) => `${table}: ${size.toFixed(2)} MB`)
      .join(", ")}

## Bandwidth Usage
- Daily Average: ${analysis.bandwidthUsage.dailyAverage} MB
- Monthly Projection: ${analysis.bandwidthUsage.monthlyProjection} MB / 5000 MB

## API Requests
- Daily Average: ${analysis.apiRequests.dailyAverage} requests (Unlimited)
- Peak Hours: ${analysis.apiRequests.peakHours.join(", ")}

## Alerts
${analysis.alerts.map((alert) => `⚠️ ${alert}`).join("\n")}

## Recommendations
${analysis.recommendations.map((rec) => `• ${rec}`).join("\n")}
    `.trim()
  }
}
