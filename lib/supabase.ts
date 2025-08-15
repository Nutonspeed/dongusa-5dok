// NOTE: No UI restructure. Types/boundary only.
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { USE_SUPABASE } from "@/lib/runtime"
import { dbOptimizer, optimizedDb } from "@/lib/database-performance-optimizer"

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
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!
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
    return optimizedDb.getProducts(filters)
  },

  async getProduct(id: string) {
    return dbOptimizer.executeQuery(
      "getProduct",
      async () => {
        if (!USE_SUPABASE) return null

        const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

        if (error) throw error
        return data as Product
      },
      `product:${id}`,
      600, // 10 minutes cache for individual products
    )
  },

  async createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
    const result = await dbOptimizer.executeQuery("createProduct", async () => {
      if (!USE_SUPABASE) return null

      const { data, error } = await supabase.from("products").insert([product]).select().single()

      if (error) throw error
      return data as Product
    })

    // Clear related caches
    ;(dbOptimizer as any).clearCacheByPattern("products:")

    return result
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const result = await dbOptimizer.executeQuery("updateProduct", async () => {
      if (!USE_SUPABASE) return null

      const { data, error } = await supabase
        .from("products")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data as Product
    })

    // Clear related caches
    ;(dbOptimizer as any).clearCacheByPattern("products:")
    ;(dbOptimizer as any).clearCacheByPattern(`product:${id}`)

    return result
  },

  async deleteProduct(id: string) {
    await dbOptimizer.executeQuery("deleteProduct", async () => {
      if (!USE_SUPABASE) return

      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error
    })

    // Clear related caches
    ;(dbOptimizer as any).clearCacheByPattern("products:")
    ;(dbOptimizer as any).clearCacheByPattern(`product:${id}`)
  },

  // Customers
  async getCustomers(filters?: {
    type?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    return optimizedDb.getCustomers(filters)
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
    return optimizedDb.getDashboardStats()
  },

  // Performance Monitoring Methods
  getPerformanceStats() {
    return dbOptimizer.getQueryStats()
  },

  getCacheStats() {
    return dbOptimizer.getCacheStats()
  },

  getSlowQueries(threshold?: number) {
    return dbOptimizer.getSlowQueries(threshold)
  },

  clearCaches() {
    dbOptimizer.clearAllCaches()
  },
}
