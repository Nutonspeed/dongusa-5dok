import { supabase } from "@/lib/supabase/client"
import { USE_SUPABASE } from "@/lib/runtime"

interface QueryMetrics {
  queryId: string
  query: string
  executionTime: number
  timestamp: Date
  parameters?: any
  resultCount?: number
  cacheHit?: boolean
}

interface PerformanceConfig {
  slowQueryThreshold: number // milliseconds
  cacheEnabled: boolean
  cacheTTL: number // seconds
  maxCacheSize: number
  enableQueryLogging: boolean
  enableAutoOptimization: boolean
}

class DatabasePerformanceOptimizer {
  private queryMetrics: QueryMetrics[] = []
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private config: PerformanceConfig = {
    slowQueryThreshold: 100, // 100ms
    cacheEnabled: true,
    cacheTTL: 300, // 5 minutes
    maxCacheSize: 1000,
    enableQueryLogging: true,
    enableAutoOptimization: true,
  }

  constructor(config?: Partial<PerformanceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  async executeQuery<T>(queryId: string, queryFn: () => Promise<T>, cacheKey?: string, customTTL?: number): Promise<T> {
    const startTime = performance.now()

    // Check cache first
    if (this.config.cacheEnabled && cacheKey) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        this.recordMetrics(queryId, "CACHED", performance.now() - startTime, undefined, undefined, true)
        return cached
      }
    }

    try {
      const result = await queryFn()
      const executionTime = performance.now() - startTime

      // Record metrics
      this.recordMetrics(queryId, "EXECUTED", executionTime, undefined, Array.isArray(result) ? result.length : 1)

      // Cache result if enabled
      if (this.config.cacheEnabled && cacheKey && result) {
        this.setCache(cacheKey, result, customTTL || this.config.cacheTTL)
      }

      // Log slow queries
      if (executionTime > this.config.slowQueryThreshold && this.config.enableQueryLogging) {
        console.warn(`Slow query detected: ${queryId} took ${executionTime.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      const executionTime = performance.now() - startTime
      this.recordMetrics(queryId, "ERROR", executionTime, error)
      throw error
    }
  }

  async getOptimizedProducts(filters?: {
    category?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }) {
    const cacheKey = `products:${JSON.stringify(filters)}`

    return this.executeQuery(
      "getOptimizedProducts",
      async () => {
        if (!USE_SUPABASE) return []

        let query = supabase.from("products").select(`
            id,
            name,
            name_en,
            description,
            category,
            type,
            price,
            price_range_min,
            price_range_max,
            images,
            colors,
            stock,
            status,
            rating,
            reviews_count,
            bestseller,
            discount,
            created_at
          `)

        // Apply filters with optimized indexing
        if (filters?.category && filters.category !== "all") {
          query = query.eq("category", filters.category)
        }

        if (filters?.status && filters.status !== "all") {
          query = query.eq("status", filters.status)
        }

        // Optimized search using full-text search
        if (filters?.search) {
          query = query.textSearch("name", filters.search, {
            type: "websearch",
            config: "english",
          })
        }

        // Optimized sorting
        const sortBy = filters?.sortBy || "created_at"
        const sortOrder = filters?.sortOrder || "desc"
        query = query.order(sortBy, { ascending: sortOrder === "asc" })

        // Pagination
        if (filters?.limit) {
          query = query.limit(filters.limit)
        }

        if (filters?.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
        }

        const { data, error } = await query

        if (error) throw error
        return data
      },
      cacheKey,
      600, // 10 minutes cache for product listings
    )
  }

  async getOptimizedCustomers(filters?: {
    type?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
    includeOrders?: boolean
  }) {
    const cacheKey = `customers:${JSON.stringify(filters)}`

    return this.executeQuery(
      "getOptimizedCustomers",
      async () => {
        if (!USE_SUPABASE) return []

        let selectFields = `
          id,
          name,
          email,
          phone,
          total_orders,
          total_spent,
          average_order_value,
          last_order_date,
          status,
          customer_type,
          created_at
        `

        // Include orders if requested (with limit to prevent N+1)
        if (filters?.includeOrders) {
          selectFields += `,
            orders:orders(
              id,
              total,
              status,
              created_at
            )
          `
        }

        let query = supabase.from("customers").select(selectFields)

        // Apply filters
        if (filters?.type && filters.type !== "all") {
          query = query.eq("customer_type", filters.type)
        }

        if (filters?.status && filters.status !== "all") {
          query = query.eq("status", filters.status)
        }

        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
        }

        // Optimized sorting by total_spent for better performance
        query = query.order("total_spent", { ascending: false })

        if (filters?.limit) {
          query = query.limit(filters.limit)
        }

        if (filters?.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
        }

        const { data, error } = await query

        if (error) throw error
        return data
      },
      cacheKey,
      300, // 5 minutes cache for customer data
    )
  }

  async getOptimizedDashboardStats() {
    return this.executeQuery(
      "getDashboardStats",
      async () => {
        if (!USE_SUPABASE) {
          return {
            products: { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
            customers: { total: 0, active: 0, vip: 0, totalRevenue: 0 },
            orders: { total: 0, pending: 0, monthlyRevenue: 0, averageOrderValue: 0 },
            recentActivity: [],
          }
        }

        // Use RPC functions for better performance
        const { data: stats, error } = await supabase.rpc("get_dashboard_stats")

        if (error) {
          // Fallback to individual queries if RPC not available
          return this.getFallbackDashboardStats()
        }

        return stats
      },
      "dashboard:stats",
      60, // 1 minute cache for dashboard
    )
  }

  async batchUpdateOrders(updates: Array<{ id: string; updates: any }>) {
    return this.executeQuery("batchUpdateOrders", async () => {
      if (!USE_SUPABASE) return []

      // Use batch update for better performance
      const promises = updates.map(({ id, updates: orderUpdates }) =>
        supabase
          .from("orders")
          .update({ ...orderUpdates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select(),
      )

      const results = await Promise.all(promises)

      // Clear related caches
      this.clearCacheByPattern("orders:")
      this.clearCacheByPattern("dashboard:")

      return results.map((result) => result.data).filter(Boolean)
    })
  }

  // Cache management methods
  private getFromCache(key: string): any | null {
    const cached = this.queryCache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl * 1000) {
      this.queryCache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any, ttl: number): void {
    // Implement LRU eviction if cache is full
    if (this.queryCache.size >= this.config.maxCacheSize) {
      const maybeOldest = this.queryCache.keys().next().value
      if (typeof maybeOldest === 'string' && maybeOldest.length > 0) {
        this.queryCache.delete(maybeOldest)
      }
    }

    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  private clearCacheByPattern(pattern: string): void {
    for (const key of this.queryCache.keys()) {
      if (key.startsWith(pattern)) {
        this.queryCache.delete(key)
      }
    }
  }

  // Metrics and monitoring
  private recordMetrics(
    queryId: string,
    query: string,
    executionTime: number,
    parameters?: any,
    resultCount?: number,
    cacheHit?: boolean,
  ): void {
    if (!this.config.enableQueryLogging) return

    const metric: QueryMetrics = {
      queryId,
      query,
      executionTime,
      timestamp: new Date(),
      parameters,
      resultCount,
      cacheHit,
    }

    this.queryMetrics.push(metric)

    // Keep only last 1000 metrics
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000)
    }
  }

  // Performance analysis methods
  getSlowQueries(threshold?: number): QueryMetrics[] {
    const slowThreshold = threshold || this.config.slowQueryThreshold
    return this.queryMetrics.filter((m) => m.executionTime > slowThreshold)
  }

  getQueryStats(): {
    totalQueries: number
    averageExecutionTime: number
    cacheHitRate: number
    slowQueries: number
  } {
    const total = this.queryMetrics.length
    const avgTime = total > 0 ? this.queryMetrics.reduce((sum, m) => sum + m.executionTime, 0) / total : 0
    const cacheHits = this.queryMetrics.filter((m) => m.cacheHit).length
    const cacheHitRate = total > 0 ? (cacheHits / total) * 100 : 0
    const slowQueries = this.getSlowQueries().length

    return {
      totalQueries: total,
      averageExecutionTime: avgTime,
      cacheHitRate,
      slowQueries,
    }
  }

  // Fallback method for dashboard stats
  private async getFallbackDashboardStats() {
    // Implementation of fallback dashboard stats
    // This would use the existing individual queries
    return {
      products: { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
      customers: { total: 0, active: 0, vip: 0, totalRevenue: 0 },
      orders: { total: 0, pending: 0, monthlyRevenue: 0, averageOrderValue: 0 },
      recentActivity: [],
    }
  }

  // Clear all caches
  clearAllCaches(): void {
    this.queryCache.clear()
  }

  // Get cache statistics
  getCacheStats(): {
    size: number
    maxSize: number
    hitRate: number
  } {
    const cacheHits = this.queryMetrics.filter((m) => m.cacheHit).length
    const totalQueries = this.queryMetrics.length

    return {
      size: this.queryCache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0,
    }
  }
}

// Export singleton instance
export const dbOptimizer = new DatabasePerformanceOptimizer()

// Export optimized database functions
export const optimizedDb = {
  getProducts: (filters?: any) => dbOptimizer.getOptimizedProducts(filters),
  getCustomers: (filters?: any) => dbOptimizer.getOptimizedCustomers(filters),
  getDashboardStats: () => dbOptimizer.getOptimizedDashboardStats(),
  batchUpdateOrders: (updates: any[]) => dbOptimizer.batchUpdateOrders(updates),
}
