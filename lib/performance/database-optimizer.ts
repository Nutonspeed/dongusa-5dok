import { supabase } from "@/lib/supabase/client"
import { cacheService } from "./cache-service"

export class DatabaseOptimizer {
  // Optimized product queries with caching
  static async getProducts(filters?: {
    category?: string
    priceRange?: [number, number]
    inStock?: boolean
    limit?: number
    offset?: number
  }) {
    const cacheKey = `products_${JSON.stringify(filters)}`
    const cached = cacheService.get(cacheKey)

    if (cached) {
      return cached
    }

    let query = supabase.from("products").select(`
        id,
        name,
        price,
        description,
        category,
        images,
        in_stock,
        stock_quantity,
        created_at
      `)

    // Apply filters
    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    if (filters?.priceRange) {
      query = query.gte("price", filters.priceRange[0]).lte("price", filters.priceRange[1])
    }

    if (filters?.inStock !== undefined) {
      query = query.eq("in_stock", filters.inStock)
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    // Order by created_at for consistent results
    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    // Cache for 5 minutes
    cacheService.set(cacheKey, data, 300)

    return data
  }

  // Optimized order queries with joins
  static async getOrdersWithDetails(userId?: string, limit = 20) {
    const cacheKey = `orders_${userId}_${limit}`
    const cached = cacheService.get(cacheKey)

    if (cached) {
      return cached
    }

    let query = supabase
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        created_at,
        updated_at,
        customer:customers(id, name, email),
        order_items(
          id,
          quantity,
          price,
          product:products(id, name, images)
        )
      `)
      .limit(limit)
      .order("created_at", { ascending: false })

    if (userId) {
      query = query.eq("customer_id", userId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Orders query failed: ${error.message}`)
    }

    // Cache for 2 minutes (orders change frequently)
    cacheService.set(cacheKey, data, 120)

    return data
  }

  // Batch operations for better performance
  static async batchUpdateInventory(updates: Array<{ productId: string; quantity: number }>) {
    const promises = updates.map(({ productId, quantity }) =>
      supabase.from("products").update({ stock_quantity: quantity }).eq("id", productId),
    )

    const results = await Promise.allSettled(promises)

    // Clear related caches
    cacheService.delete("products_")

    return results
  }

  // Database connection pooling helper
  static async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
      }
    }

    throw new Error("Max retries exceeded")
  }
}
