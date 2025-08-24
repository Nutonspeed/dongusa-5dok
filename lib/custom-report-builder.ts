import { advancedAnalytics, type CustomReport } from "./advanced-analytics-service"
import { supabase } from "./supabase"

export interface ReportFilter {
  field: string
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "between" | "in" | "contains"
  value: any
  label: string
}

export interface ReportMetric {
  id: string
  name: string
  type: "sum" | "count" | "average" | "percentage" | "ratio"
  field: string
  format: "currency" | "number" | "percentage" | "date"
}

export interface ReportVisualization {
  type: "table" | "line_chart" | "bar_chart" | "pie_chart" | "area_chart" | "metric_card"
  title: string
  data_source: string
  config: Record<string, any>
}

class CustomReportBuilder {
  private availableMetrics: ReportMetric[] = [
    { id: "total_revenue", name: "รายได้รวม", type: "sum", field: "total_amount", format: "currency" },
    { id: "order_count", name: "จำนวนคำสั่งซื้อ", type: "count", field: "id", format: "number" },
    { id: "avg_order_value", name: "มูลค่าเฉลี่ยต่อคำสั่งซื้อ", type: "average", field: "total_amount", format: "currency" },
    { id: "customer_count", name: "จำนวนลูกค้า", type: "count", field: "customer_id", format: "number" },
    { id: "conversion_rate", name: "อัตราแปลง", type: "percentage", field: "converted", format: "percentage" },
    { id: "product_sales", name: "ยอดขายสินค้า", type: "sum", field: "quantity", format: "number" },
  ]

  private availableFilters: Array<{ field: string; label: string; type: "date" | "select" | "number" | "text" }> = [
    { field: "created_at", label: "วันที่สั่งซื้อ", type: "date" },
    { field: "status", label: "สถานะคำสั่งซื้อ", type: "select" },
    { field: "customer_type", label: "ประเภทลูกค้า", type: "select" },
    { field: "total_amount", label: "มูลค่าคำสั่งซื้อ", type: "number" },
    { field: "product_category", label: "หมวดหมู่สินค้า", type: "select" },
    { field: "channel", label: "ช่องทางการขาย", type: "select" },
  ]

  // Get available metrics and filters
  getAvailableMetrics(): ReportMetric[] {
    return this.availableMetrics
  }

  getAvailableFilters() {
    return this.availableFilters
  }

  // Build report query
  async buildReportQuery(config: {
    metrics: string[]
    filters: ReportFilter[]
    groupBy?: string[]
    dateRange?: { start: string; end: string }
    limit?: number
  }): Promise<any> {
    let query = supabase.from("orders").select(`
      *,
      customer:profiles(full_name, email),
      items:order_items(
        quantity,
        price,
        product:products(name, category_id)
      )
    `)

    // Apply filters
    config.filters.forEach((filter) => {
      switch (filter.operator) {
        case "equals":
          query = query.eq(filter.field, filter.value)
          break
        case "not_equals":
          query = query.neq(filter.field, filter.value)
          break
        case "greater_than":
          query = query.gt(filter.field, filter.value)
          break
        case "less_than":
          query = query.lt(filter.field, filter.value)
          break
        case "between":
          query = query.gte(filter.field, filter.value[0]).lte(filter.field, filter.value[1])
          break
        case "in":
          query = query.in(filter.field, filter.value)
          break
        case "contains":
          query = query.ilike(filter.field, `%${filter.value}%`)
          break
      }
    })

    // Apply date range
    if (config.dateRange) {
      query = query.gte("created_at", config.dateRange.start).lte("created_at", config.dateRange.end)
    }

    // Apply limit
    if (config.limit) {
      query = query.limit(config.limit)
    }

    const { data, error } = await query

    if (error) throw error

    // Process data according to metrics and grouping
    return this.processReportData(data || [], config)
  }

  private processReportData(rawData: any[], config: any): any {
    const processedData = rawData.map((row) => {
      const processed: any = { ...row }

      // Add calculated fields
      processed.order_value = row.total_amount || 0
      processed.item_count = row.items?.length || 0
      processed.customer_name = row.customer?.full_name || "ไม่ระบุ"

      return processed
    })

    // Group data if specified
    if (config.groupBy && config.groupBy.length > 0) {
      return this.groupData(processedData, config.groupBy, config.metrics)
    }

    // Calculate metrics
    const metrics = this.calculateMetrics(processedData, config.metrics)

    return {
      data: processedData,
      metrics,
      summary: {
        total_records: processedData.length,
        date_range: config.dateRange,
        filters_applied: config.filters.length,
      },
    }
  }

  private groupData(data: any[], groupBy: string[], metrics: string[]): any {
    const grouped = data.reduce((acc, row) => {
      const key = groupBy.map((field) => row[field] || "ไม่ระบุ").join("|")

      if (!acc[key]) {
        acc[key] = {
          group_key: key,
          group_values: groupBy.reduce((obj, field) => {
            obj[field] = row[field] || "ไม่ระบุ"
            return obj
          }, {} as any),
          records: [],
        }
      }

      acc[key].records.push(row)
      return acc
    }, {} as any)

    // Calculate metrics for each group
    return Object.values(grouped).map((group: any) => ({
      ...group,
      metrics: this.calculateMetrics(group.records, metrics),
      count: group.records.length,
    }))
  }

  private calculateMetrics(data: any[], metricIds: string[]): Record<string, any> {
    const results: Record<string, any> = {}

    metricIds.forEach((metricId) => {
      const metric = this.availableMetrics.find((m) => m.id === metricId)
      if (!metric) return

      switch (metric.type) {
        case "sum":
          results[metricId] = data.reduce((sum, row) => sum + (row[metric.field] || 0), 0)
          break
        case "count":
          results[metricId] = data.length
          break
        case "average":
          const sum = data.reduce((sum, row) => sum + (row[metric.field] || 0), 0)
          results[metricId] = data.length > 0 ? sum / data.length : 0
          break
        case "percentage":
          const total = data.length
          const positive = data.filter((row) => row[metric.field]).length
          results[metricId] = total > 0 ? (positive / total) * 100 : 0
          break
      }
    })

    return results
  }

  // Create visualization config
  createVisualization(
    type: ReportVisualization["type"],
    config: {
      title: string
      data: any[]
      xAxis?: string
      yAxis?: string
      groupBy?: string
    },
  ): ReportVisualization {
    const baseConfig = {
      title: config.title,
      data: config.data,
    }

    switch (type) {
      case "line_chart":
      case "bar_chart":
      case "area_chart":
        return {
          type,
          title: config.title,
          data_source: "query_result",
          config: {
            ...baseConfig,
            xAxis: config.xAxis || "date",
            yAxis: config.yAxis || "value",
            groupBy: config.groupBy,
          },
        }

      case "pie_chart":
        return {
          type,
          title: config.title,
          data_source: "query_result",
          config: {
            ...baseConfig,
            labelField: config.xAxis || "category",
            valueField: config.yAxis || "value",
          },
        }

      case "metric_card":
        return {
          type,
          title: config.title,
          data_source: "query_result",
          config: {
            ...baseConfig,
            metric: config.yAxis || "value",
            format: "number",
          },
        }

      default:
        return {
          type: "table",
          title: config.title,
          data_source: "query_result",
          config: baseConfig,
        }
    }
  }

  // Save custom report
  // The service expects a report config without `id`, `data`, or `generated_at`.
  async saveReport(report: Omit<CustomReport, "id" | "data" | "generated_at">): Promise<CustomReport> {
    return await advancedAnalytics.generateCustomReport(report)
  }

  // Generate report templates
  getReportTemplates(): Array<{
    id: string
    name: string
    description: string
    // templates may provide partial config in a simplified shape; keep flexible
    config: any
  }> {
    return [
      {
        id: "daily_sales",
        name: "รายงานยอดขายรายวัน",
        description: "สรุปยอดขายและคำสั่งซื้อรายวัน",
          config: {
            type: "sales",
            parameters: {
              date_range: { start: "", end: "" },
              metrics: ["total_revenue", "order_count", "avg_order_value"],
              filters: {},
              grouping: "daily",
            },
            format: "json",
            visualization: "dashboard",
          },
      },
      {
        id: "customer_analysis",
        name: "รายงานวิเคราะห์ลูกค้า",
        description: "วิเคราะห์พฤติกรรมและมูลค่าลูกค้า",
        config: {
          type: "customers",
          parameters: {
            date_range: { start: "", end: "" },
            metrics: ["customer_count", "avg_order_value", "conversion_rate"],
            filters: {},
            grouping: "daily",
          },
          format: "json",
          visualization: "dashboard",
        },
      },
      {
        id: "product_performance",
        name: "รายงานประสิทธิภาพสินค้า",
        description: "วิเคราะห์ยอดขายและความนิยมของสินค้า",
        config: {
          type: "products",
          parameters: {
            date_range: { start: "", end: "" },
            metrics: ["product_sales", "total_revenue"],
            filters: {},
            grouping: "daily",
          },
          format: "json",
          visualization: "chart",
        },
      },
      {
        id: "monthly_financial",
        name: "รายงานการเงินรายเดือน",
        description: "สรุปรายได้ กำไร และค่าใช้จ่ายรายเดือน",
        config: {
          type: "financial",
          parameters: {
            date_range: { start: "", end: "" },
            metrics: ["total_revenue", "order_count"],
            filters: {},
            grouping: "monthly",
          },
          format: "json",
          visualization: "dashboard",
        },
      },
    ]
  }

  // Export report data
  async exportReportData(data: any[], format: "csv" | "excel" | "pdf"): Promise<string> {
    // Implementation for exporting data in different formats
    // This would typically use libraries like csv-writer, exceljs, or puppeteer

    switch (format) {
      case "csv":
        return this.exportToCSV(data)
      case "excel":
        return this.exportToExcel(data)
      case "pdf":
        return this.exportToPDF(data)
      default:
        throw new Error("Unsupported export format")
    }
  }

  private async exportToCSV(data: any[]): Promise<string> {
    // Mock implementation
    return "reports/export.csv"
  }

  private async exportToExcel(data: any[]): Promise<string> {
    // Mock implementation
    return "reports/export.xlsx"
  }

  private async exportToPDF(data: any[]): Promise<string> {
    // Mock implementation
    return "reports/export.pdf"
  }
}

export const customReportBuilder = new CustomReportBuilder()
