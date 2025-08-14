import { supabase } from "@/lib/supabase/client"

interface QueryCache {
  [key: string]: {
    data: any
    timestamp: number
    ttl: number
  }
}

class SupabaseQueryOptimizer {
  private cache: QueryCache = {}
  private readonly DEFAULT_TTL = 300000 // 5 minutes
  private readonly MAX_CACHE_SIZE = 100

  private getCacheKey(table: string, filters: any): string {
    return `${table}:${JSON.stringify(filters)}`
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache[key]
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      delete this.cache[key]
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    // Implement LRU eviction
    if (Object.keys(this.cache).length >= this.MAX_CACHE_SIZE) {
      const oldestKey = Object.keys(this.cache)[0]
      delete this.cache[oldestKey]
    }

    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl,
    }
  }

  async getOptimizedProducts(
    filters: {
      category?: string
      search?: string
      minPrice?: number
      maxPrice?: number
      limit?: number
      offset?: number
      sortBy?: string
      sortOrder?: "asc" | "desc"
    } = {},
  ) {
    const cacheKey = this.getCacheKey("products", filters)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const startTime = performance.now()

    try {
      let query = supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          compare_at_price,
          images,
          stock_quantity,
          category_id,
          categories!inner(
            id,
            name,
            slug
          ),
          created_at
        `)
        .eq("is_active", true)

      // Apply filters with optimized indexing
      if (filters.category && filters.category !== "all") {
        query = query.eq("category_id", filters.category)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.minPrice !== undefined) {
        query = query.gte("price", filters.minPrice)
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte("price", filters.maxPrice)
      }

      // Optimized sorting
      const sortBy = filters.sortBy || "created_at"
      const sortOrder = filters.sortOrder || "desc"
      query = query.order(sortBy, { ascending: sortOrder === "asc" })

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      const executionTime = performance.now() - startTime
      console.log(`Products query executed in ${executionTime.toFixed(2)}ms`)

      // Cache for 10 minutes
      this.setCache(cacheKey, data, 600000)

      return data
    } catch (error) {
      console.error("Optimized products query failed:", error)
      throw error
    }
  }

  async getOptimizedOrders(
    filters: {
      userId?: string
      status?: string
      limit?: number
      offset?: number
      includeItems?: boolean
    } = {},
  ) {
    const cacheKey = this.getCacheKey("orders", filters)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const startTime = performance.now()

    try {
      let selectFields = `
        id,
        status,
        total_amount,
        payment_status,
        created_at,
        updated_at,
        shipping_address,
        billing_address,
        notes
      `

      if (filters.includeItems) {
        selectFields += `,
          order_items(
            id,
            quantity,
            price,
            products(
              id,
              name,
              images
            )
          )
        `
      }

      let query = supabase.from("orders").select(selectFields)

      if (filters.userId) {
        query = query.eq("user_id", filters.userId)
      }

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status)
      }

      query = query.order("created_at", { ascending: false })

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      const executionTime = performance.now() - startTime
      console.log(`Orders query executed in ${executionTime.toFixed(2)}ms`)

      // Cache for 2 minutes (orders change frequently)
      this.setCache(cacheKey, data, 120000)

      return data
    } catch (error) {
      console.error("Optimized orders query failed:", error)
      throw error
    }
  }

  async getDashboardStats() {
    const cacheKey = "dashboard:stats"
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const startTime = performance.now()

    try {
      // Use RPC function for better performance
      const { data: stats, error } = await supabase.rpc("get_dashboard_stats")

      if (error) {
        // Fallback to individual queries
        const [productsCount, ordersCount, customersCount, monthlyRevenue] = await Promise.all([
          supabase.from("products").select("id", { count: "exact" }).eq("is_active", true),
          supabase.from("orders").select("id", { count: "exact" }),
          supabase.from("profiles").select("id", { count: "exact" }).eq("role", "customer"),
          supabase
            .from("orders")
            .select("total_amount")
            .eq("payment_status", "paid")
            .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        ])

        const totalRevenue = monthlyRevenue.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

        const fallbackStats = {
          total_products: productsCount.count || 0,
          total_orders: ordersCount.count || 0,
          total_customers: customersCount.count || 0,
          monthly_revenue: totalRevenue,
          pending_orders: 0,
          low_stock_products: 0,
        }

        this.setCache(cacheKey, fallbackStats, 60000) // 1 minute cache
        return fallbackStats
      }

      const executionTime = performance.now() - startTime
      console.log(`Dashboard stats query executed in ${executionTime.toFixed(2)}ms`)

      // Cache for 1 minute
      this.setCache(cacheKey, stats, 60000)

      return stats
    } catch (error) {
      console.error("Dashboard stats query failed:", error)
      throw error
    }
  }

  async batchUpdateProducts(updates: Array<{ id: string; updates: any }>) {
    const startTime = performance.now()

    try {
      const promises = updates.map(({ id, updates: productUpdates }) =>
        supabase
          .from("products")
          .update({ ...productUpdates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select(),
      )

      const results = await Promise.all(promises)

      // Clear related caches
      this.clearCacheByPattern("products:")
      this.clearCacheByPattern("dashboard:")

      const executionTime = performance.now() - startTime
      console.log(`Batch update executed in ${executionTime.toFixed(2)}ms`)

      return results.map((result) => result.data).filter(Boolean)
    } catch (error) {
      console.error("Batch update failed:", error)
      throw error
    }
  }

  private clearCacheByPattern(pattern: string): void {
    Object.keys(this.cache).forEach((key) => {
      if (key.startsWith(pattern)) {
        delete this.cache[key]
      }
    })
  }

  clearAllCache(): void {
    this.cache = {}
  }

  getCacheStats(): {
    size: number
    keys: string[]
    totalMemory: number
  } {
    const keys = Object.keys(this.cache)
    const totalMemory = JSON.stringify(this.cache).length

    return {
      size: keys.length,
      keys,
      totalMemory,
    }
  }

  async executeWithMetrics<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    const startTime = performance.now()

    try {
      const result = await queryFn()
      const executionTime = performance.now() - startTime

      // Log slow queries
      if (executionTime > 100) {
        console.warn(`Slow query detected: ${queryName} took ${executionTime.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      const executionTime = performance.now() - startTime
      console.error(`Query failed: ${queryName} after ${executionTime.toFixed(2)}ms`, error)
      throw error
    }
  }
}

// Export singleton instance
export const supabaseOptimizer = new SupabaseQueryOptimizer()

// Export optimized query functions
export const optimizedQueries = {
  getProducts: (filters?: any) => supabaseOptimizer.getOptimizedProducts(filters),
  getOrders: (filters?: any) => supabaseOptimizer.getOptimizedOrders(filters),
  getDashboardStats: () => supabaseOptimizer.getDashboardStats(),
  batchUpdateProducts: (updates: any[]) => supabaseOptimizer.batchUpdateProducts(updates),
  clearCache: () => supabaseOptimizer.clearAllCache(),
  getCacheStats: () => supabaseOptimizer.getCacheStats(),
}
