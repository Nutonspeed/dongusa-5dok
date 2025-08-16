import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export interface AnalyticsData {
  revenue: {
    total: number
    growth: number
    byPeriod: Array<{ period: string; amount: number }>
  }
  customers: {
    total: number
    new: number
    returning: number
    retention: number
  }
  products: {
    topSelling: Array<{ id: string; name: string; sales: number }>
    lowStock: Array<{ id: string; name: string; stock: number }>
  }
  marketing: {
    campaigns: Array<{ name: string; roi: number; conversions: number }>
    channels: Array<{ channel: string; traffic: number; conversions: number }>
  }
}

export class BusinessIntelligenceService {
  async getRevenueAnalytics(startDate: Date, endDate: Date) {
    const { data: orders } = await supabase
      .from("orders")
      .select("total_amount, created_at, status")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .eq("status", "completed")

    if (!orders) return { total: 0, growth: 0, byPeriod: [] }

    const total = orders.reduce((sum, order) => sum + order.total_amount, 0)

    // Calculate growth compared to previous period
    const periodLength = endDate.getTime() - startDate.getTime()
    const previousStart = new Date(startDate.getTime() - periodLength)
    const previousEnd = new Date(endDate.getTime() - periodLength)

    const { data: previousOrders } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", previousStart.toISOString())
      .lte("created_at", previousEnd.toISOString())
      .eq("status", "completed")

    const previousTotal = previousOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const growth = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0

    // Group by day/week/month based on period length
    const byPeriod = this.groupOrdersByPeriod(orders, startDate, endDate)

    return { total, growth, byPeriod }
  }

  async getCustomerAnalytics() {
    const { data: customers } = await supabase.from("profiles").select("id, created_at")

    const { data: orders } = await supabase.from("orders").select("customer_id, created_at").eq("status", "completed")

    if (!customers || !orders) return { total: 0, new: 0, returning: 0, retention: 0 }

    const total = customers.length
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const newCustomers = customers.filter((c) => new Date(c.created_at) > thirtyDaysAgo).length

    // Calculate returning customers (customers with more than one order)
    const customerOrderCounts = orders.reduce(
      (acc, order) => {
        acc[order.customer_id] = (acc[order.customer_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const returningCustomers = Object.values(customerOrderCounts).filter((count) => count > 1).length
    const retention = total > 0 ? (returningCustomers / total) * 100 : 0

    return { total, new: newCustomers, returning: returningCustomers, retention }
  }

  async getProductAnalytics() {
    const { data: orderItems } = await supabase.from("order_items").select(`
        quantity,
        products (id, name, stock_quantity)
      `)

    if (!orderItems) return { topSelling: [], lowStock: [] }

    // Calculate top selling products
    const productSales = orderItems.reduce(
      (acc, item) => {
        const productId = item.products.id
        acc[productId] = {
          id: productId,
          name: item.products.name,
          sales: (acc[productId]?.sales || 0) + item.quantity,
        }
        return acc
      },
      {} as Record<string, { id: string; name: string; sales: number }>,
    )

    const topSelling = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)

    // Get low stock products
    const { data: products } = await supabase
      .from("products")
      .select("id, name, stock_quantity")
      .lt("stock_quantity", 10)
      .order("stock_quantity", { ascending: true })

    const lowStock =
      products?.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock_quantity,
      })) || []

    return { topSelling, lowStock }
  }

  async getMarketingAnalytics() {
    // Mock data for marketing analytics - in real implementation, integrate with marketing tools
    const campaigns = [
      { name: "Summer Sale 2025", roi: 320, conversions: 156 },
      { name: "New Year Promotion", roi: 280, conversions: 89 },
      { name: "Valentine Special", roi: 450, conversions: 234 },
    ]

    const channels = [
      { channel: "Facebook Ads", traffic: 2340, conversions: 187 },
      { channel: "Google Ads", traffic: 1890, conversions: 156 },
      { channel: "Email Marketing", traffic: 1200, conversions: 98 },
      { channel: "Organic Search", traffic: 3400, conversions: 234 },
    ]

    return { campaigns, channels }
  }

  private groupOrdersByPeriod(orders: any[], startDate: Date, endDate: Date) {
    const periodLength = endDate.getTime() - startDate.getTime()
    const days = periodLength / (1000 * 60 * 60 * 24)

    let groupBy: "day" | "week" | "month" = "day"
    if (days > 90) groupBy = "month"
    else if (days > 30) groupBy = "week"

    const groups: Record<string, number> = {}

    orders.forEach((order) => {
      const date = new Date(order.created_at)
      let key: string

      if (groupBy === "day") {
        key = date.toISOString().split("T")[0]
      } else if (groupBy === "week") {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split("T")[0]
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }

      groups[key] = (groups[key] || 0) + order.total_amount
    })

    return Object.entries(groups).map(([period, amount]) => ({ period, amount }))
  }

  async generateBusinessReport(startDate: Date, endDate: Date): Promise<AnalyticsData> {
    const [revenue, customers, products, marketing] = await Promise.all([
      this.getRevenueAnalytics(startDate, endDate),
      this.getCustomerAnalytics(),
      this.getProductAnalytics(),
      this.getMarketingAnalytics(),
    ])

    return { revenue, customers, products, marketing }
  }
}
