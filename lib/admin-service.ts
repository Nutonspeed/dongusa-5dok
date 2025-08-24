import { createClient } from "@/lib/supabase/client"
import { DatabaseService } from "@/lib/database"
import { logger } from "@/lib/logger"

export interface AdminStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  pendingOrders: number
  lowStockProducts: number
  monthlyGrowth: {
    orders: number
    revenue: number
    customers: number
  }
}

export interface AdminOrder {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  total_amount: number
  status: string
  channel: string
  created_at: string
  updated_at: string
  items: AdminOrderItem[]
  shipping_info?: any
  payment_info?: any
  notes?: string
}

export interface AdminOrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  size?: string
  color?: string
  fabric_pattern?: string
}

export interface AdminCustomer {
  id: string
  full_name: string
  email: string
  phone?: string
  total_orders: number
  total_spent: number
  last_order_date?: string
  created_at: string
  status: "active" | "inactive" | "vip"
  segment: string
  loyalty_points: number
}

export interface AdminProduct {
  id: string
  name: string
  name_en?: string
  category_id: string
  category?: {
    name: string
    slug: string
  }
  price: number
  compare_at_price?: number
  stock_quantity: number
  sold_quantity: number
  status: "active" | "draft" | "archived"
  is_featured: boolean
  is_new: boolean
  rating: number
  reviews_count: number
  created_at: string
  updated_at: string
}

export class AdminService {
  private supabase = createClient()
  private db = new DatabaseService(this.supabase)

  // Dashboard Statistics
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const [ordersResult, customersResult, productsResult] = await Promise.all([
        this.supabase.from("orders").select("total_amount, created_at"),
        this.supabase.from("profiles").select("id, created_at"),
        this.supabase.from("products").select("id, stock_quantity, sold_quantity"),
      ])

      const orders = ordersResult.data || []
      const customers = customersResult.data || []
      const products = productsResult.data || []

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
  const lowStockProducts = products.filter((p: any) => p.stock_quantity <= 10).length

      // Calculate monthly growth (mock data for now)
      const monthlyGrowth = {
        orders: 12.5,
        revenue: 8.2,
        customers: 15.3,
      }

      return {
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers: customers.length,
        totalProducts: products.length,
        pendingOrders: orders.filter((o: any) => o.status === "pending").length,
        lowStockProducts,
        monthlyGrowth,
      }
    } catch (error) {
      logger.error("Error fetching dashboard stats:", error)
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        monthlyGrowth: { orders: 0, revenue: 0, customers: 0 },
      }
    }
  }

  // Order Management
  async getOrders(filters?: {
    status?: string
    channel?: string
    dateFrom?: string
    dateTo?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<AdminOrder[]> {
    try {
      let query = this.supabase.from("orders").select(`
        *,
        items:order_items(*)
      `)

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status)
      }

      if (filters?.channel && filters.channel !== "all") {
        query = query.eq("channel", filters.channel)
      }

      if (filters?.dateFrom) {
        query = query.gte("created_at", filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte("created_at", filters.dateTo)
      }

      if (filters?.search) {
        query = query.or(
          `customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%,id.ilike.%${filters.search}%`,
        )
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
      }

      query = query.order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error("Error fetching orders:", error)
      return []
    }
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("orders")
        .update({
          status,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error updating order status:", error)
      return false
    }
  }

  async bulkUpdateOrderStatus(orderIds: string[], status: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .in("id", orderIds)

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error bulk updating order status:", error)
      return false
    }
  }

  // Customer Management
  async getCustomers(filters?: {
    segment?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<AdminCustomer[]> {
    try {
      let query = this.supabase.from("profiles").select(`
        *,
        orders:orders(total_amount, created_at)
      `)

      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
        )
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      // Process customer data to calculate stats
      const customers = (data || []).map((customer: any) => {
        const orders = customer.orders || []
  const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
        const lastOrderDate = orders.length > 0 ? orders[orders.length - 1].created_at : null

        return {
          id: customer.id,
          full_name: customer.full_name || customer.email,
          email: customer.email,
          phone: customer.phone,
          total_orders: orders.length,
          total_spent: totalSpent,
          last_order_date: lastOrderDate,
          created_at: customer.created_at,
          status: orders.length > 0 ? "active" : "inactive",
          segment: totalSpent > 10000 ? "vip" : totalSpent > 5000 ? "regular" : "new",
          loyalty_points: Math.floor(totalSpent / 100),
        }
      })

  return customers as AdminCustomer[]
    } catch (error) {
      logger.error("Error fetching customers:", error)
      return []
    }
  }

  // Product Management
  async getProducts(filters?: {
    category?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<AdminProduct[]> {
    try {
      let query = this.supabase.from("products").select(`
        *,
        category:categories(name, slug)
      `)

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category_id", filters.category)
      }

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%`)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error("Error fetching products:", error)
      return []
    }
  }

  async updateProductStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("products")
        .update({
          stock_quantity: quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId)

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error updating product stock:", error)
      return false
    }
  }

  // Analytics
  async getAnalytics(dateRange: { from: string; to: string }) {
    try {
      const [ordersResult, customersResult, productsResult] = await Promise.all([
        this.supabase
          .from("orders")
          .select("total_amount, created_at, status")
          .gte("created_at", dateRange.from)
          .lte("created_at", dateRange.to),
        this.supabase
          .from("profiles")
          .select("created_at")
          .gte("created_at", dateRange.from)
          .lte("created_at", dateRange.to),
        this.supabase.from("products").select("sold_quantity, stock_quantity"),
      ])

      const orders = ordersResult.data || []
      const customers = customersResult.data || []
      const products = productsResult.data || []

      // Calculate analytics
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
      const conversionRate = customers.length > 0 ? (orders.length / customers.length) * 100 : 0

      // Group orders by date for chart data
  const dailyRevenue = orders.reduce((acc: any, order: any) => {
        const date = new Date(order.created_at).toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + (order.total_amount || 0)
        return acc
      }, {})

      return {
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        averageOrderValue,
        conversionRate,
        dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
          date,
          revenue,
        })),
  topProducts: products.sort((a: any, b: any) => (b.sold_quantity || 0) - (a.sold_quantity || 0)).slice(0, 10),
      }
    } catch (error) {
      logger.error("Error fetching analytics:", error)
      return null
    }
  }

  // Notifications and Alerts
  async getSystemAlerts() {
    try {
      const [lowStockResult, pendingOrdersResult] = await Promise.all([
        this.supabase.from("products").select("name, stock_quantity").lte("stock_quantity", 10),
        this.supabase.from("orders").select("id, customer_name, created_at").eq("status", "pending"),
      ])

      const lowStockProducts = lowStockResult.data || []
      const pendingOrders = pendingOrdersResult.data || []

      return {
        lowStockProducts,
        pendingOrders,
        totalAlerts: lowStockProducts.length + pendingOrders.length,
      }
    } catch (error) {
      logger.error("Error fetching system alerts:", error)
      return {
        lowStockProducts: [],
        pendingOrders: [],
        totalAlerts: 0,
      }
    }
  }

  // Export Functions
  async exportOrders(orderIds: string[], format: "csv" | "excel" = "csv") {
    try {
      const orders = await this.getOrders()
      const filteredOrders = orders.filter((order) => orderIds.includes(order.id))

      if (format === "csv") {
        const csvHeaders = [
          "Order ID",
          "Customer Name",
          "Phone",
          "Email",
          "Total Amount",
          "Status",
          "Channel",
          "Created Date",
          "Notes",
        ]

        const csvData = filteredOrders.map((order) => [
          order.id,
          order.customer_name,
          order.customer_phone,
          order.customer_email,
          order.total_amount,
          order.status,
          order.channel,
          new Date(order.created_at).toLocaleDateString(),
          order.notes || "",
        ])

        return {
          headers: csvHeaders,
          data: csvData,
        }
      }

      return filteredOrders
    } catch (error) {
      logger.error("Error exporting orders:", error)
      return null
    }
  }
}

export const adminService = new AdminService()
