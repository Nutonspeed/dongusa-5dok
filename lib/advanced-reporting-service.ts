import { supabase } from "./supabase"
import { USE_SUPABASE } from "./runtime"

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: "sales" | "inventory" | "customers" | "financial" | "marketing" | "operations"
  type: "standard" | "custom" | "scheduled"
  parameters: ReportParameter[]
  query: string
  visualization: VisualizationConfig
  schedule?: ScheduleConfig
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ReportParameter {
  id: string
  name: string
  label: string
  type: "date" | "dateRange" | "select" | "multiSelect" | "number" | "text" | "boolean"
  required: boolean
  defaultValue?: any
  options?: Array<{ value: any; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface VisualizationConfig {
  type: "table" | "chart" | "dashboard" | "pivot"
  chartType?: "bar" | "line" | "pie" | "area" | "scatter" | "combo"
  columns: Array<{
    key: string
    label: string
    type: "text" | "number" | "currency" | "percentage" | "date"
    format?: string
    aggregation?: "sum" | "avg" | "count" | "min" | "max"
  }>
  groupBy?: string[]
  sortBy?: Array<{ column: string; direction: "asc" | "desc" }>
  filters?: Array<{
    column: string
    operator: "equals" | "contains" | "greater_than" | "less_than" | "between"
    value: any
  }>
}

export interface ScheduleConfig {
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  time: string // HH:MM format
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  recipients: string[]
  format: "pdf" | "excel" | "csv"
  includeCharts: boolean
}

export interface ReportExecution {
  id: string
  templateId: string
  parameters: Record<string, any>
  status: "pending" | "running" | "completed" | "failed"
  data?: any[]
  metadata?: {
    totalRows: number
    executionTime: number
    generatedAt: string
    fileSize?: number
  }
  error?: string
  createdAt: string
  completedAt?: string
}

export interface ExportOptions {
  format: "pdf" | "excel" | "csv" | "json"
  includeCharts: boolean
  includeMetadata: boolean
  compression?: boolean
  password?: string
  watermark?: string
}

class AdvancedReportingService {
  private templates: ReportTemplate[] = []
  private executions: ReportExecution[] = []

  async initializeDefaultTemplates(): Promise<void> {
    const defaultTemplates: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt">[] = [
      {
        name: "รายงานยอดขายรายวัน",
        description: "สรุปยอดขายและคำสั่งซื้อรายวัน พร้อมการเปรียบเทียบ",
        category: "sales",
        type: "standard",
        parameters: [
          {
            id: "date_range",
            name: "dateRange",
            label: "ช่วงวันที่",
            type: "dateRange",
            required: true,
            defaultValue: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              end: new Date().toISOString().split("T")[0],
            },
          },
          {
            id: "include_comparison",
            name: "includeComparison",
            label: "เปรียบเทียบกับช่วงก่อนหน้า",
            type: "boolean",
            required: false,
            defaultValue: true,
          },
        ],
        query: `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value,
            COUNT(DISTINCT user_id) as unique_customers
          FROM orders 
          WHERE created_at BETWEEN $1 AND $2
            AND payment_status = 'paid'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `,
        visualization: {
          type: "chart",
          chartType: "combo",
          columns: [
            { key: "date", label: "วันที่", type: "date" },
            { key: "total_orders", label: "จำนวนคำสั่งซื้อ", type: "number" },
            { key: "total_revenue", label: "รายได้", type: "currency", format: "THB" },
            { key: "avg_order_value", label: "มูลค่าเฉลี่ย", type: "currency", format: "THB" },
            { key: "unique_customers", label: "ลูกค้าใหม่", type: "number" },
          ],
          sortBy: [{ column: "date", direction: "desc" }],
        },
        isActive: true,
        createdBy: "system",
      },
      {
        name: "รายงานสินค้าขายดี",
        description: "รายงานสินค้าที่ขายดีที่สุด พร้อมการวิเคราะห์แนวโน้ม",
        category: "sales",
        type: "standard",
        parameters: [
          {
            id: "period",
            name: "period",
            label: "ช่วงเวลา",
            type: "select",
            required: true,
            defaultValue: "30d",
            options: [
              { value: "7d", label: "7 วันล่าสุด" },
              { value: "30d", label: "30 วันล่าสุด" },
              { value: "90d", label: "90 วันล่าสุด" },
              { value: "1y", label: "1 ปีล่าสุด" },
            ],
          },
          {
            id: "category",
            name: "category",
            label: "หมวดหมู่สินค้า",
            type: "select",
            required: false,
            options: [
              { value: "all", label: "ทั้งหมด" },
              { value: "covers", label: "ผ้าคลุมโซฟา" },
              { value: "accessories", label: "อุปกรณ์เสริม" },
            ],
          },
          {
            id: "limit",
            name: "limit",
            label: "จำนวนสินค้า",
            type: "number",
            required: false,
            defaultValue: 20,
            validation: { min: 5, max: 100 },
          },
        ],
        query: `
          SELECT 
            p.id,
            p.name,
            p.category_id,
            c.name as category_name,
            SUM(oi.quantity) as total_sold,
            SUM(oi.quantity * oi.price) as total_revenue,
            AVG(oi.price) as avg_price,
            COUNT(DISTINCT o.user_id) as unique_buyers,
            p.stock_quantity as current_stock
          FROM products p
          JOIN order_items oi ON p.id = oi.product_id
          JOIN orders o ON oi.order_id = o.id
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE o.created_at >= NOW() - INTERVAL '$1 days'
            AND o.payment_status = 'paid'
            AND ($2 = 'all' OR c.slug = $2)
          GROUP BY p.id, p.name, p.category_id, c.name, p.stock_quantity
          ORDER BY total_sold DESC
          LIMIT $3
        `,
        visualization: {
          type: "table",
          columns: [
            { key: "name", label: "ชื่อสินค้า", type: "text" },
            { key: "category_name", label: "หมวดหมู่", type: "text" },
            { key: "total_sold", label: "ขายได้", type: "number" },
            { key: "total_revenue", label: "รายได้", type: "currency", format: "THB" },
            { key: "avg_price", label: "ราคาเฉลี่ย", type: "currency", format: "THB" },
            { key: "unique_buyers", label: "ลูกค้า", type: "number" },
            { key: "current_stock", label: "คงเหลือ", type: "number" },
          ],
          sortBy: [{ column: "total_sold", direction: "desc" }],
        },
        isActive: true,
        createdBy: "system",
      },
      {
        name: "รายงานลูกค้าและ CLV",
        description: "การวิเคราะห์ลูกค้าและมูลค่าตลอดชีวิต (Customer Lifetime Value)",
        category: "customers",
        type: "standard",
        parameters: [
          {
            id: "segment",
            name: "segment",
            label: "กลุ่มลูกค้า",
            type: "multiSelect",
            required: false,
            options: [
              { value: "new", label: "ลูกค้าใหม่" },
              { value: "regular", label: "ลูกค้าประจำ" },
              { value: "vip", label: "ลูกค้า VIP" },
              { value: "inactive", label: "ลูกค้าไม่ใช้งาน" },
            ],
          },
          {
            id: "min_orders",
            name: "minOrders",
            label: "จำนวนคำสั่งซื้อขั้นต่ำ",
            type: "number",
            required: false,
            defaultValue: 1,
            validation: { min: 1 },
          },
        ],
        query: `
          SELECT 
            p.id,
            p.email,
            p.name,
            p.phone,
            COUNT(o.id) as total_orders,
            SUM(o.total_amount) as total_spent,
            AVG(o.total_amount) as avg_order_value,
            MAX(o.created_at) as last_order_date,
            MIN(o.created_at) as first_order_date,
            EXTRACT(DAYS FROM (MAX(o.created_at) - MIN(o.created_at))) as customer_lifespan_days,
            CASE 
              WHEN COUNT(o.id) = 1 THEN 'new'
              WHEN COUNT(o.id) BETWEEN 2 AND 5 THEN 'regular'
              WHEN COUNT(o.id) > 5 AND SUM(o.total_amount) > 50000 THEN 'vip'
              WHEN MAX(o.created_at) < NOW() - INTERVAL '90 days' THEN 'inactive'
              ELSE 'regular'
            END as customer_segment
          FROM profiles p
          JOIN orders o ON p.id = o.user_id
          WHERE o.payment_status = 'paid'
            AND COUNT(o.id) >= $2
          GROUP BY p.id, p.email, p.name, p.phone
          HAVING ($1 IS NULL OR CASE 
            WHEN COUNT(o.id) = 1 THEN 'new'
            WHEN COUNT(o.id) BETWEEN 2 AND 5 THEN 'regular'
            WHEN COUNT(o.id) > 5 AND SUM(o.total_amount) > 50000 THEN 'vip'
            WHEN MAX(o.created_at) < NOW() - INTERVAL '90 days' THEN 'inactive'
            ELSE 'regular'
          END = ANY($1))
          ORDER BY total_spent DESC
        `,
        visualization: {
          type: "table",
          columns: [
            { key: "name", label: "ชื่อลูกค้า", type: "text" },
            { key: "email", label: "อีเมล", type: "text" },
            { key: "customer_segment", label: "กลุ่ม", type: "text" },
            { key: "total_orders", label: "คำสั่งซื้อ", type: "number" },
            { key: "total_spent", label: "ใช้จ่ายรวม", type: "currency", format: "THB" },
            { key: "avg_order_value", label: "มูลค่าเฉลี่ย", type: "currency", format: "THB" },
            { key: "last_order_date", label: "สั่งซื้อล่าสุด", type: "date" },
            { key: "customer_lifespan_days", label: "ระยะเวลา (วัน)", type: "number" },
          ],
          sortBy: [{ column: "total_spent", direction: "desc" }],
        },
        isActive: true,
        createdBy: "system",
      },
      {
        name: "รายงานสต็อกและการจัดการสินค้าคงคลัง",
        description: "รายงานสถานะสต็อก การเคลื่อนไหว และการพยากรณ์",
        category: "inventory",
        type: "standard",
        parameters: [
          {
            id: "low_stock_threshold",
            name: "lowStockThreshold",
            label: "เกณฑ์สต็อกต่ำ",
            type: "number",
            required: false,
            defaultValue: 10,
            validation: { min: 1, max: 100 },
          },
          {
            id: "include_inactive",
            name: "includeInactive",
            label: "รวมสินค้าที่ไม่ใช้งาน",
            type: "boolean",
            required: false,
            defaultValue: false,
          },
        ],
        query: `
          SELECT 
            p.id,
            p.name,
            p.sku,
            c.name as category_name,
            p.stock_quantity,
            p.price,
            p.cost_price,
            (p.price - p.cost_price) as profit_per_unit,
            p.stock_quantity * p.cost_price as inventory_value,
            COALESCE(sales.total_sold_30d, 0) as sold_last_30_days,
            COALESCE(sales.total_sold_90d, 0) as sold_last_90_days,
            CASE 
              WHEN p.stock_quantity <= $1 THEN 'low'
              WHEN p.stock_quantity = 0 THEN 'out_of_stock'
              WHEN p.stock_quantity > 100 THEN 'overstocked'
              ELSE 'normal'
            END as stock_status,
            CASE 
              WHEN COALESCE(sales.total_sold_30d, 0) > 0 
              THEN p.stock_quantity / (COALESCE(sales.total_sold_30d, 0) / 30.0)
              ELSE NULL
            END as days_of_inventory
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN (
            SELECT 
              oi.product_id,
              SUM(CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN oi.quantity ELSE 0 END) as total_sold_30d,
              SUM(CASE WHEN o.created_at >= NOW() - INTERVAL '90 days' THEN oi.quantity ELSE 0 END) as total_sold_90d
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.payment_status = 'paid'
            GROUP BY oi.product_id
          ) sales ON p.id = sales.product_id
          WHERE ($2 = true OR p.is_active = true)
          ORDER BY 
            CASE 
              WHEN p.stock_quantity = 0 THEN 1
              WHEN p.stock_quantity <= $1 THEN 2
              ELSE 3
            END,
            p.stock_quantity ASC
        `,
        visualization: {
          type: "table",
          columns: [
            { key: "name", label: "ชื่อสินค้า", type: "text" },
            { key: "sku", label: "รหัสสินค้า", type: "text" },
            { key: "category_name", label: "หมวดหมู่", type: "text" },
            { key: "stock_quantity", label: "คงเหลือ", type: "number" },
            { key: "stock_status", label: "สถานะ", type: "text" },
            { key: "sold_last_30_days", label: "ขาย 30 วัน", type: "number" },
            { key: "days_of_inventory", label: "วันคงเหลือ", type: "number" },
            { key: "inventory_value", label: "มูลค่าสต็อก", type: "currency", format: "THB" },
            { key: "profit_per_unit", label: "กำไร/ชิ้น", type: "currency", format: "THB" },
          ],
          sortBy: [{ column: "stock_quantity", direction: "asc" }],
          filters: [{ column: "stock_status", operator: "equals", value: "low" }],
        },
        isActive: true,
        createdBy: "system",
      },
    ]

    this.templates = defaultTemplates.map((template, index) => ({
      ...template,
      id: `template_${Date.now()}_${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    if (USE_SUPABASE) {
      await supabase.from("report_templates").upsert(this.templates)
    }
  }

  async getTemplates(category?: string): Promise<ReportTemplate[]> {
    if (this.templates.length === 0) {
      await this.initializeDefaultTemplates()
    }

    if (USE_SUPABASE) {
      let query = supabase.from("report_templates").select("*").eq("isActive", true)
      if (category) {
        query = query.eq("category", category)
      }
      const { data } = await query.order("name")
      return data || this.templates
    }

    return category ? this.templates.filter((t) => t.category === category) : this.templates
  }

  async getTemplate(id: string): Promise<ReportTemplate | null> {
    if (USE_SUPABASE) {
      const { data } = await supabase.from("report_templates").select("*").eq("id", id).single()
      return data
    }
    return this.templates.find((t) => t.id === id) || null
  }

  async createTemplate(template: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt">): Promise<ReportTemplate> {
    const newTemplate: ReportTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.templates.push(newTemplate)

    if (USE_SUPABASE) {
      await supabase.from("report_templates").insert([newTemplate])
    }

    return newTemplate
  }

  async executeReport(templateId: string, parameters: Record<string, any>): Promise<ReportExecution> {
    const template = await this.getTemplate(templateId)
    if (!template) {
      throw new Error("Template not found")
    }

    const execution: ReportExecution = {
      id: `exec_${Date.now()}`,
      templateId,
      parameters,
      status: "running",
      createdAt: new Date().toISOString(),
    }

    this.executions.push(execution)

    try {
      const startTime = Date.now()

      // Execute the query with parameters
      const data = await this.executeQuery(template.query, parameters)

      const executionTime = Date.now() - startTime

      execution.status = "completed"
      execution.data = data
      execution.metadata = {
        totalRows: data.length,
        executionTime,
        generatedAt: new Date().toISOString(),
      }
      execution.completedAt = new Date().toISOString()

      if (USE_SUPABASE) {
        await supabase.from("report_executions").upsert([execution])
      }

      return execution
    } catch (error) {
      execution.status = "failed"
      execution.error = error instanceof Error ? error.message : "Unknown error"
      execution.completedAt = new Date().toISOString()

      if (USE_SUPABASE) {
        await supabase.from("report_executions").upsert([execution])
      }

      throw error
    }
  }

  private async executeQuery(query: string, parameters: Record<string, any>): Promise<any[]> {
    // Mock implementation - in real app, this would execute against the database
    // For now, return sample data based on the query type

    if (query.includes("DATE(created_at) as date")) {
      // Daily sales report
      return [
        { date: "2024-01-20", total_orders: 15, total_revenue: 45000, avg_order_value: 3000, unique_customers: 12 },
        { date: "2024-01-19", total_orders: 12, total_revenue: 38000, avg_order_value: 3167, unique_customers: 10 },
        { date: "2024-01-18", total_orders: 18, total_revenue: 52000, avg_order_value: 2889, unique_customers: 15 },
      ]
    } else if (query.includes("SUM(oi.quantity) as total_sold")) {
      // Top products report
      return [
        {
          id: "1",
          name: "ผ้าคลุมโซฟากำมะหยี่",
          category_name: "ผ้าคลุมโซฟา",
          total_sold: 45,
          total_revenue: 135000,
          avg_price: 3000,
          unique_buyers: 38,
          current_stock: 25,
        },
        {
          id: "2",
          name: "ผ้าคลุมโซฟากันน้ำ",
          category_name: "ผ้าคลุมโซฟา",
          total_sold: 32,
          total_revenue: 96000,
          avg_price: 3000,
          unique_buyers: 28,
          current_stock: 15,
        },
      ]
    } else if (query.includes("COUNT(o.id) as total_orders")) {
      // Customer CLV report
      return [
        {
          id: "1",
          name: "สมชาย ใจดี",
          email: "somchai@example.com",
          customer_segment: "vip",
          total_orders: 8,
          total_spent: 65000,
          avg_order_value: 8125,
          last_order_date: "2024-01-15",
          customer_lifespan_days: 180,
        },
        {
          id: "2",
          name: "สมหญิง สวยงาม",
          email: "somying@example.com",
          customer_segment: "regular",
          total_orders: 3,
          total_spent: 25000,
          avg_order_value: 8333,
          last_order_date: "2024-01-10",
          customer_lifespan_days: 90,
        },
      ]
    } else if (query.includes("p.stock_quantity")) {
      // Inventory report
      return [
        {
          id: "1",
          name: "ผ้าคลุมโซฟาลายดอก",
          sku: "SC001",
          category_name: "ผ้าคลุมโซฟา",
          stock_quantity: 5,
          price: 3500,
          cost_price: 2000,
          profit_per_unit: 1500,
          inventory_value: 10000,
          sold_last_30_days: 8,
          sold_last_90_days: 25,
          stock_status: "low",
          days_of_inventory: 18.75,
        },
        {
          id: "2",
          name: "หมอนอิงสีพื้น",
          sku: "AC002",
          category_name: "อุปกรณ์เสริม",
          stock_quantity: 0,
          price: 450,
          cost_price: 250,
          profit_per_unit: 200,
          inventory_value: 0,
          sold_last_30_days: 12,
          sold_last_90_days: 35,
          stock_status: "out_of_stock",
          days_of_inventory: 0,
        },
      ]
    }

    return []
  }

  async exportReport(
    executionId: string,
    options: ExportOptions,
  ): Promise<{
    success: boolean
    downloadUrl?: string
    filename?: string
    error?: string
  }> {
    const execution = this.executions.find((e) => e.id === executionId)
    if (!execution || execution.status !== "completed") {
      return { success: false, error: "Execution not found or not completed" }
    }

    const template = await this.getTemplate(execution.templateId)
    if (!template) {
      return { success: false, error: "Template not found" }
    }

    try {
      const filename = `${template.name}_${new Date().toISOString().split("T")[0]}.${options.format}`

      // Mock implementation - in real app, this would generate the actual file
      const downloadUrl = `/api/reports/download/${executionId}?format=${options.format}`

      return {
        success: true,
        downloadUrl,
        filename,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Export failed",
      }
    }
  }

  async scheduleReport(
    templateId: string,
    schedule: ScheduleConfig,
    parameters: Record<string, any>,
  ): Promise<{
    success: boolean
    scheduleId?: string
    error?: string
  }> {
    try {
      const scheduleId = `schedule_${Date.now()}`

      // Mock implementation - in real app, this would set up a cron job or similar
      console.log(`Scheduled report ${templateId} with schedule:`, schedule)

      return {
        success: true,
        scheduleId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Scheduling failed",
      }
    }
  }

  async getExecutions(templateId?: string): Promise<ReportExecution[]> {
    if (USE_SUPABASE) {
      let query = supabase.from("report_executions").select("*")
      if (templateId) {
        query = query.eq("templateId", templateId)
      }
      const { data } = await query.order("createdAt", { ascending: false })
      return data || []
    }

    return templateId ? this.executions.filter((e) => e.templateId === templateId) : this.executions
  }

  async getReportingAnalytics(): Promise<{
    totalReports: number
    totalExecutions: number
    avgExecutionTime: number
    popularTemplates: Array<{ templateId: string; name: string; executionCount: number }>
    recentActivity: Array<{ templateName: string; executedAt: string; status: string }>
  }> {
    const executions = await this.getExecutions()
    const templates = await this.getTemplates()

    const totalReports = templates.length
    const totalExecutions = executions.length
    const completedExecutions = executions.filter((e) => e.status === "completed")
    const avgExecutionTime =
      completedExecutions.length > 0
        ? completedExecutions.reduce((sum, e) => sum + (e.metadata?.executionTime || 0), 0) / completedExecutions.length
        : 0

    // Count executions per template
    const templateExecutionCounts = executions.reduce(
      (acc, exec) => {
        acc[exec.templateId] = (acc[exec.templateId] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const popularTemplates = Object.entries(templateExecutionCounts)
      .map(([templateId, count]) => {
        const template = templates.find((t) => t.id === templateId)
        return {
          templateId,
          name: template?.name || "Unknown",
          executionCount: count,
        }
      })
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, 5)

    const recentActivity = executions.slice(0, 10).map((exec) => {
      const template = templates.find((t) => t.id === exec.templateId)
      return {
        templateName: template?.name || "Unknown",
        executedAt: exec.createdAt,
        status: exec.status,
      }
    })

    return {
      totalReports,
      totalExecutions,
      avgExecutionTime,
      popularTemplates,
      recentActivity,
    }
  }
}

export const advancedReportingService = new AdvancedReportingService()
