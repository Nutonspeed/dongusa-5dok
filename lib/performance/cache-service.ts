interface CacheOptions {
  ttl?: number // Time to live in seconds
  maxSize?: number // Maximum cache size
}

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize: number

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000
  }

  set<T>(key: string, data: T, ttl = 300): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (typeof oldestKey === "string") {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    }
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const cacheService = new CacheService({ maxSize: 500, ttl: 300 })

// Cache decorators for functions
export function cached(ttl = 300) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyName}_${JSON.stringify(args)}`

      // Try to get from cache first
      const cached = cacheService.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Execute original method
      const result = await method.apply(this, args)

      // Cache the result
      cacheService.set(cacheKey, result, ttl)

      return result
    }
  }
}
