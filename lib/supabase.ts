import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { USE_SUPABASE } from "@/lib/runtime"

export function createSupabase() {
  if (!USE_SUPABASE) {
    return {
      from: () => ({
        select: () => ({
          eq: () => ({ single: async () => ({ data: null, error: null }) }),
        }),
        insert: async () => ({ data: null, error: null }),
        update: () => ({ eq: async () => ({ data: null, error: null }) }),
        delete: () => ({ eq: async () => ({ data: null, error: null }) }),
      }),
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
    } as any
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!
  return createClient<Database>(url, anon)
}

export const supabase = createSupabase()

// Database Types
export interface Product {
  id: string
  name: string
  name_en: string
  description: string
  description_en: string
  category: "covers" | "accessories"
  type: "custom" | "fixed"
  price?: number
  price_range_min?: number
  price_range_max?: number
  images: string[]
  colors: Array<{
    name: string
    name_en: string
    value: string
  }>
  sizes?: Array<{
    name: string
    name_en: string
    price: number
  }>
  features: {
    th: string[]
    en: string[]
  }
  specifications: {
    material: { th: string; en: string }
    care: { th: string; en: string }
    origin: { th: string; en: string }
    warranty: { th: string; en: string }
  }
  stock: number
  status: "active" | "draft" | "low_stock" | "out_of_stock"
  rating: number
  reviews_count: number
  sold_count: number
  bestseller: boolean
  discount: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  total_orders: number
  total_spent: number
  average_order_value: number
  last_order_date: string
  join_date: string
  status: "active" | "inactive"
  customer_type: "new" | "regular" | "frequent" | "premium" | "vip"
  favorite_category: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  customer: Customer
  items: Array<{
    product_id: string
    name: string
    quantity: number
    price: number
    specifications: string
  }>
  total: number
  status: "pending" | "production" | "shipped" | "completed" | "cancelled"
  payment_status: "pending" | "paid" | "refunded"
  payment_method: "bank_transfer" | "promptpay" | "cod" | "credit_card"
  shipping_address: string
  tracking_number?: string
  estimated_delivery: string
  delivered_at?: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Analytics {
  id: string
  date: string
  revenue: number
  orders_count: number
  customers_count: number
  new_customers: number
  product_sales: Record<string, number>
  category_sales: Record<string, number>
  payment_methods: Record<string, number>
  shipping_areas: Record<string, number>
  created_at: string
}

// Database Functions
export const db = {
  // Products
  async getProducts(filters?: {
    category?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    // Return mock data if no real Supabase connection
    if (!USE_SUPABASE) {
      return []
    }

    let query = supabase.from("products").select("*").order("created_at", { ascending: false })

    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category)
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
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Product[]
  },

  async getProduct(id: string) {
    if (!USE_SUPABASE) {
      return null
    }

    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) throw error
    return data as Product
  },

  async createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
    if (!USE_SUPABASE) {
      return null
    }

    const { data, error } = await supabase.from("products").insert([product]).select().single()

    if (error) throw error
    return data as Product
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    if (!USE_SUPABASE) {
      return null
    }

    const { data, error } = await supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  async deleteProduct(id: string) {
    if (!USE_SUPABASE) {
      return
    }

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) throw error
  },

  // Customers
  async getCustomers(filters?: {
    type?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    if (!USE_SUPABASE) {
      return []
    }

    let query = supabase.from("customers").select("*").order("created_at", { ascending: false })

    if (filters?.type && filters.type !== "all") {
      query = query.eq("customer_type", filters.type)
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Customer[]
  },

  async getCustomer(id: string) {
    if (!USE_SUPABASE) {
      return null
    }

    const { data, error } = await supabase.from("customers").select("*").eq("id", id).single()

    if (error) throw error
    return data as Customer
  },

  async createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at">) {
    if (!USE_SUPABASE) {
      return null
    }

    const { data, error } = await supabase.from("customers").insert([customer]).select().single()

    if (error) throw error
    return data as Customer
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    if (!USE_SUPABASE) {
      return null
    }

    const { data, error } = await supabase
      .from("customers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Customer
  },

  // Orders
  async getOrders(filters?: {
    status?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    if (!USE_SUPABASE) {
      return []
    }

    let query = supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*)
      `)
      .order("created_at", { ascending: false })

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters?.search) {
      query = query.or(`id.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Order[]
  },

  async getOrder(id: string) {
    if (!USE_SUPABASE) {
      return null
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Order
  },

  async createOrder(order: Omit<Order, "id" | "created_at" | "updated_at" | "customer">) {
    if (!USE_SUPABASE) {
      return null
    }

    const { data, error } = await supabase.from("orders").insert([order]).select().single()

    if (error) throw error
    return data as Omit<Order, "customer">
  },

  async updateOrder(id: string, updates: Partial<Omit<Order, "customer">>) {
    if (!USE_SUPABASE) {
      return null
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Omit<Order, "customer">
  },

  // Analytics
  async getAnalytics(filters?: {
    startDate?: string
    endDate?: string
    period?: "daily" | "weekly" | "monthly"
  }) {
    if (!USE_SUPABASE) {
      return []
    }

    let query = supabase.from("analytics").select("*").order("date", { ascending: true })

    if (filters?.startDate) {
      query = query.gte("date", filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte("date", filters.endDate)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Analytics[]
  },

  async createAnalyticsEntry(analytics: Omit<Analytics, "id" | "created_at">) {
    if (!USE_SUPABASE) {
      return null
    }

    const { data, error } = await supabase.from("analytics").insert([analytics]).select().single()

    if (error) throw error
    return data as Analytics
  },

  // Dashboard Stats
  async getDashboardStats() {
    if (!USE_SUPABASE) {
      return {
        products: { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
        customers: { total: 0, active: 0, vip: 0, totalRevenue: 0 },
        orders: { total: 0, pending: 0, monthlyRevenue: 0, averageOrderValue: 0 },
        analytics: [],
      }
    }

    const [{ data: products }, { data: customers }, { data: orders }, { data: analytics }] = await Promise.all([
      supabase.from("products").select("id, status, stock"),
      supabase.from("customers").select("id, status, customer_type, total_spent"),
      supabase
        .from("orders")
        .select("id, status, total, created_at")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("analytics")
        .select("*")
        .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ])

    const totalProducts = products?.length || 0
      const activeProducts = products?.filter((p: any) => p.status === "active").length || 0
      const lowStockProducts = products?.filter((p: any) => p.stock <= 10).length || 0
      const outOfStockProducts = products?.filter((p: any) => p.stock === 0).length || 0

    const totalCustomers = customers?.length || 0
      const activeCustomers = customers?.filter((c: any) => c.status === "active").length || 0
      const vipCustomers = customers?.filter((c: any) => c.customer_type === "vip").length || 0
      const totalRevenue =
        customers?.reduce((sum: number, c: any) => sum + (c.total_spent || 0), 0) || 0

    const totalOrders = orders?.length || 0
      const pendingOrders = orders?.filter((o: any) => o.status === "pending").length || 0
      const monthlyRevenue = orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0
    const averageOrderValue = totalOrders > 0 ? monthlyRevenue / totalOrders : 0

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        vip: vipCustomers,
        totalRevenue,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        monthlyRevenue,
        averageOrderValue,
      },
      analytics: analytics || [],
    }
  },
}
