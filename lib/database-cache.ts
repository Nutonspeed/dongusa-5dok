import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Simple in-memory cache for frequently accessed data
class DatabaseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttlMinutes = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const dbCache = new DatabaseCache()

export async function getCachedProducts(categoryId?: string) {
  const cacheKey = `products_${categoryId || "all"}`
  const cached = dbCache.get(cacheKey)

  if (cached) {
    return cached
  }

  // This would be replaced with actual Supabase query
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  let query = supabase.from("products").select("*")

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  const { data, error } = await query

  if (!error && data) {
    dbCache.set(cacheKey, data, 10) // Cache for 10 minutes
  }

  return data
}

export async function getCachedCategories() {
  const cacheKey = "categories"
  const cached = dbCache.get(cacheKey)

  if (cached) {
    return cached
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data, error } = await supabase.from("categories").select("*")

  if (!error && data) {
    dbCache.set(cacheKey, data, 30) // Cache for 30 minutes
  }

  return data
}

setInterval(
  () => {
    dbCache.cleanup()
  },
  5 * 60 * 1000,
) // Clean up every 5 minutes
