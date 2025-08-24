import { dbCache } from "./database-cache"

interface PerformanceConfig {
  enableCaching: boolean
  cacheTimeout: number
  enableCompression: boolean
  enableLazyLoading: boolean
  maxBundleSize: number
}

class PerformanceOptimizer {
  private config: PerformanceConfig = {
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    enableCompression: true,
    enableLazyLoading: true,
    maxBundleSize: 250000, // 250KB
  }

  // Advanced caching with Redis-like functionality
  async getCachedData<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    if (!this.config.enableCaching) {
      return await fetcher()
    }

    const cached = dbCache.get(key)
    if (cached) {
      return cached as T
    }

    const data = await fetcher()
    dbCache.set(key, data, ttl ? ttl / 60000 : this.config.cacheTimeout / 60000)
    return data
  }

  // Batch operations for better performance
  async batchOperation<T, R>(items: T[], operation: (batch: T[]) => Promise<R[]>, batchSize = 10): Promise<R[]> {
    const results: R[] = []

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await operation(batch)
      results.push(...batchResults)
    }

    return results
  }

  // Preload critical resources
  preloadCriticalResources() {
    if (typeof window !== "undefined") {
      // Preload critical fonts
      const fontLink = document.createElement("link")
      fontLink.rel = "preload"
      fontLink.href = "/fonts/inter-var.woff2"
      fontLink.as = "font"
      fontLink.type = "font/woff2"
      fontLink.crossOrigin = "anonymous"
      document.head.appendChild(fontLink)

      // Preload critical images
      const heroImage = new Image()
      heroImage.src = "/images/hero-sofa.webp"

      // Prefetch likely next pages
      const prefetchLinks = ["/products", "/collections", "/about"]
      prefetchLinks.forEach((href) => {
        const link = document.createElement("link")
        link.rel = "prefetch"
        link.href = href
        document.head.appendChild(link)
      })
    }
  }

  // Monitor performance metrics
  measurePerformance(name: string, fn: () => Promise<any>) {
    return async (...args: any[]) => {
      const start = performance.now()
      try {
  const result = await (fn as any)(...args)
        const duration = performance.now() - start

        // Log slow operations
        if (duration > 1000) {
          console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
        }

        // Send to analytics in production
        if (process.env.NODE_ENV === "production") {
          this.sendPerformanceMetric(name, duration)
        }

        return result
      } catch (error) {
        const duration = performance.now() - start
        console.error(`Operation failed: ${name} after ${duration.toFixed(2)}ms`, error)
        throw error
      }
    }
  }

  private sendPerformanceMetric(name: string, duration: number) {
    // Integration with analytics service
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "performance_metric", {
        event_category: "Performance",
        event_label: name,
        value: Math.round(duration),
      })
    }
  }

  // Optimize images on the fly
  optimizeImageUrl(src: string, width?: number, quality = 75): string {
    if (!src) return "/placeholder.svg"

    // If it's already optimized or external, return as is
    if (src.includes("/_next/image") || src.startsWith("http")) {
      return src
    }

    const params = new URLSearchParams()
    if (width) params.set("w", width.toString())
    params.set("q", quality.toString())

    return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`
  }

  // Bundle size monitoring
  checkBundleSize() {
    if (typeof window !== "undefined" && "performance" in window) {
      const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
      let totalJSSize = 0
      let totalCSSSize = 0

      entries.forEach((entry) => {
        if (entry.name.includes(".js")) {
          totalJSSize += entry.transferSize || 0
        } else if (entry.name.includes(".css")) {
          totalCSSSize += entry.transferSize || 0
        }
      })

      if (totalJSSize > this.config.maxBundleSize) {
        console.warn(`Bundle size warning: JS bundle is ${(totalJSSize / 1024).toFixed(2)}KB`)
      }

      return { totalJSSize, totalCSSSize }
    }

    return { totalJSSize: 0, totalCSSSize: 0 }
  }
}

export const performanceOptimizer = new PerformanceOptimizer()

// Utility functions for common optimizations
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
  timeout = setTimeout(() => (func as any)(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
  (func as any)(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()
  return ((...args: any[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}
