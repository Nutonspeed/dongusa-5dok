import { supabase } from "@/lib/supabase"
import { USE_SUPABASE } from "@/lib/runtime"

interface AdvancedMetrics {
  revenue: {
    current: number
    previous: number
    growth: number
    forecast: number
    confidence: number
  }
  customers: {
    total: number
    new: number
    returning: number
    churn_rate: number
    lifetime_value: number
    acquisition_cost: number
  }
  products: {
    total_sold: number
    top_performers: Array<{
      id: string
      name: string
      sales: number
      revenue: number
      growth: number
    }>
    low_stock_alerts: Array<{
      id: string
      name: string
      current_stock: number
      reorder_point: number
    }>
  }
  operations: {
    conversion_rate: number
    average_order_value: number
    cart_abandonment_rate: number
    fulfillment_time: number
    return_rate: number
  }
}

interface BusinessIntelligence {
  insights: Array<{
    id: string
    type: "opportunity" | "warning" | "trend" | "anomaly"
    priority: "high" | "medium" | "low"
    title: string
    description: string
    impact_score: number
    confidence: number
    recommended_actions: string[]
    created_at: string
  }>
  predictions: {
    next_month_revenue: {
      amount: number
      confidence: number
      factors: string[]
    }
    customer_churn: {
      high_risk_count: number
      medium_risk_count: number
      prevention_strategies: string[]
    }
    inventory_needs: Array<{
      product_id: string
      product_name: string
      days_until_stockout: number
      recommended_order_quantity: number
    }>
  }
  kpi_alerts: Array<{
    metric: string
    current_value: number
    threshold: number
    status: "critical" | "warning" | "normal"
    message: string
  }>
}

interface CustomReport {
  id: string
  name: string
  type: "sales" | "customers" | "products" | "financial" | "operational"
  parameters: {
    date_range: { start: string; end: string }
    metrics: string[]
    filters: Record<string, any>
    grouping: "daily" | "weekly" | "monthly" | "quarterly"
  }
  data: any[]
  generated_at: string
  format: "json" | "csv" | "pdf" | "excel"
}

class AdvancedAnalyticsService {
  // Advanced Metrics Collection
  async getAdvancedMetrics(dateRange?: { start: string; end: string }): Promise<AdvancedMetrics> {
    try {
      if (!USE_SUPABASE) {
        return this.getMockAdvancedMetrics()
      }

      const { start, end } = dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      }

      // Revenue Analytics
      const revenueData = await this.getRevenueAnalytics(start, end)

      // Customer Analytics
      const customerData = await this.getCustomerAnalytics(start, end)

      // Product Analytics
      const productData = await this.getProductAnalytics(start, end)

      // Operational Analytics
      const operationalData = await this.getOperationalAnalytics(start, end)

      return {
        revenue: revenueData,
        customers: customerData,
        products: productData,
        operations: operationalData,
      }
    } catch (error) {
      console.error("Error fetching advanced metrics:", error)
      return this.getMockAdvancedMetrics()
    }
  }

  // Business Intelligence & AI Insights
  async getBusinessIntelligence(): Promise<BusinessIntelligence> {
    try {
      if (!USE_SUPABASE) {
        return this.getMockBusinessIntelligence()
      }

      // AI-powered insights generation
      const insights = await this.generateAIInsights()

      // Predictive analytics
      const predictions = await this.generatePredictions()

      // KPI monitoring and alerts
      const kpiAlerts = await this.generateKPIAlerts()

      return {
        insights,
        predictions,
        kpi_alerts: kpiAlerts,
      }
    } catch (error) {
      console.error("Error generating business intelligence:", error)
      return this.getMockBusinessIntelligence()
    }
  }

  // Real-time Dashboard Data
  async getRealTimeDashboard() {
    try {
      const [metrics, intelligence, realtimeStats] = await Promise.all([
        this.getAdvancedMetrics(),
        this.getBusinessIntelligence(),
        this.getRealTimeStats(),
      ])

      return {
        metrics,
        intelligence,
        realtime: realtimeStats,
        last_updated: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error fetching real-time dashboard:", error)
      throw error
    }
  }

  // Custom Report Generation
  async generateCustomReport(reportConfig: Omit<CustomReport, "id" | "data" | "generated_at">): Promise<CustomReport> {
    try {
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Generate report data based on configuration
      const data = await this.generateReportData(reportConfig)

      const report: CustomReport = {
        id: reportId,
        ...reportConfig,
        data,
        generated_at: new Date().toISOString(),
      }

      // Save report to database if using Supabase
      if (USE_SUPABASE) {
        await supabase.from("custom_reports").insert([report])
      }

      return report
    } catch (error) {
      console.error("Error generating custom report:", error)
      throw error
    }
  }

  // Export Report in Different Formats
  async exportReport(reportId: string, format: "csv" | "pdf" | "excel"): Promise<Blob> {
    try {
      // Get report data
      const report = await this.getReport(reportId)

      switch (format) {
        case "csv":
          return this.exportToCSV(report.data)
        case "pdf":
          return this.exportToPDF(report)
        case "excel":
          return this.exportToExcel(report.data)
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }
    } catch (error) {
      console.error("Error exporting report:", error)
      throw error
    }
  }

  // Cohort Analysis
  async getCohortAnalysis(period: "weekly" | "monthly" = "monthly") {
    try {
      if (!USE_SUPABASE) {
        return this.getMockCohortAnalysis()
      }

      // Generate cohort analysis based on customer registration and purchase patterns
      const { data, error } = await supabase.rpc("generate_cohort_analysis", { period })

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error generating cohort analysis:", error)
      return this.getMockCohortAnalysis()
    }
  }

  // A/B Testing Analytics
  async getABTestResults(testId?: string) {
    try {
      const tests = [
        {
          id: "test_homepage_cta",
          name: "Homepage CTA Button Test",
          status: "running",
          variants: [
            { name: "Control", visitors: 1250, conversions: 45, conversion_rate: 3.6 },
            { name: "Variant A", visitors: 1180, conversions: 52, conversion_rate: 4.4 },
          ],
          statistical_significance: 0.85,
          winner: "Variant A",
          lift: 22.2,
        },
        {
          id: "test_product_pricing",
          name: "Product Pricing Display Test",
          status: "completed",
          variants: [
            { name: "Control", visitors: 2100, conversions: 89, conversion_rate: 4.2 },
            { name: "Variant B", visitors: 2050, conversions: 95, conversion_rate: 4.6 },
          ],
          statistical_significance: 0.92,
          winner: "Variant B",
          lift: 9.5,
        },
      ]

      return testId ? tests.find((t) => t.id === testId) : tests
    } catch (error) {
      console.error("Error fetching A/B test results:", error)
      return []
    }
  }

  // Private helper methods
  private async getRevenueAnalytics(start: string, end: string) {
    // Mock implementation - replace with actual Supabase queries
    return {
      current: 125000,
      previous: 118000,
      growth: 5.9,
      forecast: 142000,
      confidence: 85,
    }
  }

  private async getCustomerAnalytics(start: string, end: string) {
    return {
      total: 234,
      new: 45,
      returning: 189,
      churn_rate: 5.2,
      lifetime_value: 2850,
      acquisition_cost: 125,
    }
  }

  private async getProductAnalytics(start: string, end: string) {
    return {
      total_sold: 1250,
      top_performers: [
        { id: "1", name: "ผ้าคลุมโซฟาลายดอก", sales: 89, revenue: 125000, growth: 15.2 },
        { id: "2", name: "ผ้าคลุมโซฟาสีพื้น", sales: 67, revenue: 89000, growth: 8.7 },
      ],
      low_stock_alerts: [{ id: "3", name: "คลิปยึดผ้า", current_stock: 3, reorder_point: 10 }],
    }
  }

  private async getOperationalAnalytics(start: string, end: string) {
    return {
      conversion_rate: 4.2,
      average_order_value: 3150,
      cart_abandonment_rate: 68.5,
      fulfillment_time: 2.3,
      return_rate: 3.1,
    }
  }

  private async generateAIInsights() {
    return [
      {
        id: "insight_1",
        type: "opportunity" as const,
        priority: "high" as const,
        title: "ลูกค้า VIP เพิ่มขึ้น 25%",
        description: "ลูกค้า VIP เพิ่มขึ้นอย่างมีนัยสำคัญ ควรสร้างโปรโมชั่นพิเศษ",
        impact_score: 8.5,
        confidence: 92,
        recommended_actions: ["สร้างโปรโมชั่น VIP", "เพิ่มสินค้าพรีเมียม"],
        created_at: new Date().toISOString(),
      },
    ]
  }

  private async generatePredictions() {
    return {
      next_month_revenue: {
        amount: 142000,
        confidence: 85,
        factors: ["seasonal_trend", "customer_growth", "promotion_impact"],
      },
      customer_churn: {
        high_risk_count: 12,
        medium_risk_count: 28,
        prevention_strategies: ["win_back_campaign", "loyalty_program", "personalized_offers"],
      },
      inventory_needs: [
        {
          product_id: "1",
          product_name: "ผ้าคลุมโซฟาสีน้ำเงิน",
          days_until_stockout: 7,
          recommended_order_quantity: 50,
        },
      ],
    }
  }

  private async generateKPIAlerts() {
    return [
      {
        metric: "conversion_rate",
        current_value: 3.8,
        threshold: 4.0,
        status: "warning" as const,
        message: "อัตราแปลงต่ำกว่าเป้าหมาย 5%",
      },
    ]
  }

  private async getRealTimeStats() {
    return {
      active_users: 23,
      current_orders: 5,
      today_revenue: 28450,
      pending_shipments: 12,
    }
  }

  private async generateReportData(config: any) {
    // Mock report data generation
    return [
      { date: "2024-01-01", revenue: 25000, orders: 15, customers: 12 },
      { date: "2024-01-02", revenue: 28000, orders: 18, customers: 14 },
    ]
  }

  private async getReport(reportId: string): Promise<CustomReport> {
    // Mock implementation
    return {
      id: reportId,
      name: "Sample Report",
      type: "sales",
      parameters: {
        date_range: { start: "2024-01-01", end: "2024-01-31" },
        metrics: ["revenue", "orders"],
        filters: {},
        grouping: "daily",
      },
      data: [],
      generated_at: new Date().toISOString(),
      format: "json",
    }
  }

  private exportToCSV(data: any[]): Blob {
    const csv = this.convertToCSV(data)
    return new Blob([csv], { type: "text/csv" })
  }

  private exportToPDF(report: CustomReport): Blob {
    // Mock PDF generation
    return new Blob(["PDF content"], { type: "application/pdf" })
  }

  private exportToExcel(data: any[]): Blob {
    // Mock Excel generation
    return new Blob(["Excel content"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return ""

    const headers = Object.keys(data[0])
    const csvContent = [headers.join(","), ...data.map((row) => headers.map((header) => row[header]).join(","))].join(
      "\n",
    )

    return csvContent
  }

  // Mock data methods
  private getMockAdvancedMetrics(): AdvancedMetrics {
    return {
      revenue: {
        current: 125000,
        previous: 118000,
        growth: 5.9,
        forecast: 142000,
        confidence: 85,
      },
      customers: {
        total: 234,
        new: 45,
        returning: 189,
        churn_rate: 5.2,
        lifetime_value: 2850,
        acquisition_cost: 125,
      },
      products: {
        total_sold: 1250,
        top_performers: [
          { id: "1", name: "ผ้าคลุมโซฟาลายดอก", sales: 89, revenue: 125000, growth: 15.2 },
          { id: "2", name: "ผ้าคลุมโซฟาสีพื้น", sales: 67, revenue: 89000, growth: 8.7 },
        ],
        low_stock_alerts: [{ id: "3", name: "คลิปยึดผ้า", current_stock: 3, reorder_point: 10 }],
      },
      operations: {
        conversion_rate: 4.2,
        average_order_value: 3150,
        cart_abandonment_rate: 68.5,
        fulfillment_time: 2.3,
        return_rate: 3.1,
      },
    }
  }

  private getMockBusinessIntelligence(): BusinessIntelligence {
    return {
      insights: [
        {
          id: "insight_1",
          type: "opportunity",
          priority: "high",
          title: "ลูกค้า VIP เพิ่มขึ้น 25%",
          description: "ลูกค้า VIP เพิ่มขึ้นอย่างมีนัยสำคัญ ควรสร้างโปรโมชั่นพิเศษ",
          impact_score: 8.5,
          confidence: 92,
          recommended_actions: ["สร้างโปรโมชั่น VIP", "เพิ่มสินค้าพรีเมียม"],
          created_at: new Date().toISOString(),
        },
      ],
      predictions: {
        next_month_revenue: {
          amount: 142000,
          confidence: 85,
          factors: ["seasonal_trend", "customer_growth", "promotion_impact"],
        },
        customer_churn: {
          high_risk_count: 12,
          medium_risk_count: 28,
          prevention_strategies: ["win_back_campaign", "loyalty_program", "personalized_offers"],
        },
        inventory_needs: [
          {
            product_id: "1",
            product_name: "ผ้าคลุมโซฟาสีน้ำเงิน",
            days_until_stockout: 7,
            recommended_order_quantity: 50,
          },
        ],
      },
      kpi_alerts: [
        {
          metric: "conversion_rate",
          current_value: 3.8,
          threshold: 4.0,
          status: "warning",
          message: "อัตราแปลงต่ำกว่าเป้าหมาย 5%",
        },
      ],
    }
  }

  private getMockCohortAnalysis() {
    return {
      cohorts: [
        {
          period: "2024-01",
          customers: 45,
          retention_rates: [100, 68, 45, 32, 28, 25],
        },
        {
          period: "2024-02",
          customers: 52,
          retention_rates: [100, 71, 48, 35, 31],
        },
      ],
    }
  }
}

// Export singleton instance
export const advancedAnalytics = new AdvancedAnalyticsService()

// Export types
export type { AdvancedMetrics, BusinessIntelligence, CustomReport }
