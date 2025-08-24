import { analytics } from "./analytics-service"
import { logger } from "./logger"

interface MobileAPIConfig {
  version: string
  compression: boolean
  caching: boolean
  batchRequests: boolean
  offlineSupport: boolean
  dataMinification: boolean
}

interface APIResponse<T = any> {
  data: T
  meta: {
    version: string
    timestamp: string
    cached: boolean
    compressed: boolean
    requestId: string
  }
  pagination?: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface BatchRequest {
  id: string
  method: string
  endpoint: string
  params?: Record<string, any>
  body?: any
}

interface OfflineQueueItem {
  id: string
  method: string
  endpoint: string
  data: any
  timestamp: string
  retryCount: number
  priority: "low" | "normal" | "high"
}

export class MobileAPIOptimizer {
  private config: MobileAPIConfig
  private cache: Map<string, { data: any; expiry: number }> = new Map()
  private offlineQueue: OfflineQueueItem[] = []
  private isOnline = true

  constructor() {
    this.config = {
      version: "1.0",
      compression: true,
      caching: true,
      batchRequests: true,
      offlineSupport: true,
      dataMinification: true,
    }

    this.initializeOfflineSupport()
    this.startOfflineQueueProcessor()
  }

  private initializeOfflineSupport() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine

      window.addEventListener("online", () => {
        this.isOnline = true
        this.processOfflineQueue()
      })

      window.addEventListener("offline", () => {
        this.isOnline = false
      })
    }
  }

  // Optimized API request with mobile-specific features
  async request<T = any>(
    endpoint: string,
    options: {
      method?: string
      params?: Record<string, any>
      body?: any
      cache?: boolean
      compress?: boolean
      priority?: "low" | "normal" | "high"
      timeout?: number
    } = {},
  ): Promise<APIResponse<T>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    try {
      // Check cache first
      if (options.cache !== false && this.config.caching) {
        const cached = this.getCachedResponse<T>(endpoint, options.params)
        if (cached) {
          analytics.trackEvent("api_cache_hit", "performance", endpoint, 1)
          return cached
        }
      }

      // Handle offline scenario
      if (!this.isOnline && this.config.offlineSupport) {
        if (options.method && options.method !== "GET") {
          this.queueOfflineRequest(endpoint, options, requestId)
          throw new Error("Request queued for when online")
        } else {
          // Try to return cached data for GET requests
          const cached = this.getCachedResponse<T>(endpoint, options.params, true)
          if (cached) {
            return { ...cached, meta: { ...cached.meta, cached: true } }
          }
          throw new Error("No cached data available offline")
        }
      }

      // Build request URL and options
      const url = this.buildURL(endpoint, options.params)
      const requestOptions = await this.buildRequestOptions(options)

      // Make the request with timeout
      const response = await this.fetchWithTimeout(url, requestOptions, options.timeout || 10000)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      let data = await response.json()

      // Apply data minification for mobile
      if (this.config.dataMinification) {
        data = this.minifyData(data)
      }

      const apiResponse: APIResponse<T> = {
        data,
        meta: {
          version: this.config.version,
          timestamp: new Date().toISOString(),
          cached: false,
          compressed: options.compress !== false && this.config.compression,
          requestId,
        },
      }

      // Cache successful responses
      if (options.cache !== false && this.config.caching && options.method !== "POST") {
        this.setCachedResponse(endpoint, options.params, apiResponse)
      }

      // Track performance
      const duration = Date.now() - startTime
      analytics.trackEvent("api_request", "performance", endpoint, duration, {
        method: options.method || "GET",
        cached: false,
        duration,
      })

      return apiResponse
    } catch (error) {
      logger.error(`API request failed: ${endpoint}`, error)

      // Try to return cached data on error
      if (this.config.caching) {
        const cached = this.getCachedResponse<T>(endpoint, options.params, true)
        if (cached) {
          analytics.trackEvent("api_fallback_cache", "performance", endpoint, 1)
          return { ...cached, meta: { ...cached.meta, cached: true } }
        }
      }

      throw error
    }
  }

  // Batch multiple requests for efficiency
  async batchRequest(requests: BatchRequest[]): Promise<Record<string, APIResponse>> {
    if (!this.config.batchRequests) {
      // Fallback to individual requests
      const results: Record<string, APIResponse> = {}
      for (const request of requests) {
        try {
          results[request.id] = await this.request(request.endpoint, {
            method: request.method,
            params: request.params,
            body: request.body,
          })
        } catch (error) {
          results[request.id] = {
            data: null,
            meta: {
              version: this.config.version,
              timestamp: new Date().toISOString(),
              cached: false,
              compressed: false,
              requestId: this.generateRequestId(),
            },
          }
        }
      }
      return results
    }

    try {
      const response = await fetch("/api/mobile/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Version": this.config.version,
        },
        body: JSON.stringify({ requests }),
      })

      if (!response.ok) {
        throw new Error(`Batch request failed: ${response.status}`)
      }

      const batchResponse = await response.json()

      // Track batch request
      analytics.trackEvent("api_batch_request", "performance", "batch", requests.length, {
        requestCount: requests.length,
      })

      return batchResponse.results
    } catch (error) {
      logger.error("Batch request failed, falling back to individual requests", error)
      return this.batchRequest(requests) // This will use the fallback logic
    }
  }

  // Mobile-optimized product search
  async searchProducts(query: {
    search?: string
    category?: string
    priceRange?: [number, number]
    sortBy?: string
    page?: number
    limit?: number
  }): Promise<APIResponse<any[]>> {
    const optimizedQuery = {
      ...query,
      limit: Math.min(query.limit || 20, 50), // Limit results for mobile
      fields: "id,name,price,images,rating,availability", // Only essential fields
    }

    return this.request("/api/mobile/products/search", {
      method: "GET",
      params: optimizedQuery,
      cache: true,
    })
  }

  // Mobile-optimized order management
  async getOrders(
    params: {
      status?: string
      page?: number
      limit?: number
    } = {},
  ): Promise<APIResponse<any[]>> {
    const optimizedParams = {
      ...params,
      limit: Math.min(params.limit || 10, 20),
      fields: "id,status,total,created_at,items.name,items.quantity",
    }

    return this.request("/api/mobile/orders", {
      method: "GET",
      params: optimizedParams,
      cache: true,
    })
  }

  // Mobile-optimized user profile
  async getUserProfile(): Promise<APIResponse<any>> {
    return this.request("/api/mobile/profile", {
      method: "GET",
      cache: true,
      compress: true,
    })
  }

  // Offline queue management
  private queueOfflineRequest(endpoint: string, options: any, requestId: string) {
    const queueItem: OfflineQueueItem = {
      id: requestId,
      method: options.method || "GET",
      endpoint,
      data: {
        params: options.params,
        body: options.body,
      },
      timestamp: new Date().toISOString(),
      retryCount: 0,
      priority: options.priority || "normal",
    }

    this.offlineQueue.push(queueItem)
    this.sortOfflineQueue()

    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("mobile_api_offline_queue", JSON.stringify(this.offlineQueue))
    }
  }

  private sortOfflineQueue() {
    const priorityOrder = { high: 3, normal: 2, low: 1 }
    this.offlineQueue.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    })
  }

  private startOfflineQueueProcessor() {
    setInterval(() => {
      if (this.isOnline && this.offlineQueue.length > 0) {
        this.processOfflineQueue()
      }
    }, 5000) // Check every 5 seconds
  }

  private async processOfflineQueue() {
    if (!this.isOnline || this.offlineQueue.length === 0) return

    const itemsToProcess = this.offlineQueue.splice(0, 5) // Process 5 at a time

    for (const item of itemsToProcess) {
      try {
        await this.request(item.endpoint, {
          method: item.method,
          params: item.data.params,
          body: item.data.body,
          cache: false,
        })

        analytics.trackEvent("offline_request_processed", "sync", item.endpoint, 1)
      } catch (error) {
        item.retryCount++
        if (item.retryCount < 3) {
          // Re-queue with exponential backoff
          setTimeout(() => {
            this.offlineQueue.push(item)
            this.sortOfflineQueue()
          }, Math.pow(2, item.retryCount) * 1000)
        } else {
          logger.error(`Failed to process offline request after 3 retries: ${item.endpoint}`, error)
        }
      }
    }

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("mobile_api_offline_queue", JSON.stringify(this.offlineQueue))
    }
  }

  // Cache management
  private getCachedResponse<T>(endpoint: string, params?: any, allowExpired = false): APIResponse<T> | null {
    const cacheKey = this.generateCacheKey(endpoint, params)
    const cached = this.cache.get(cacheKey)

    if (!cached) return null

    if (!allowExpired && Date.now() > cached.expiry) {
      this.cache.delete(cacheKey)
      return null
    }

    return cached.data
  }

  private setCachedResponse(endpoint: string, params: any, response: APIResponse, ttl = 300000) {
    const cacheKey = this.generateCacheKey(endpoint, params)
    this.cache.set(cacheKey, {
      data: response,
      expiry: Date.now() + ttl,
    })

    // Limit cache size
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value
      if (typeof oldestKey === "string") {
        this.cache.delete(oldestKey)
      }
    }
  }

  private generateCacheKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : ""
    return `${endpoint}:${paramString}`
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || ""
    let url = `${baseURL}${endpoint}`

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    return url
  }

  private async buildRequestOptions(options: any): Promise<RequestInit> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-API-Version": this.config.version,
      "X-Client-Type": "mobile",
    }

    if (options.compress !== false && this.config.compression) {
      headers["Accept-Encoding"] = "gzip, deflate, br"
    }

    const requestOptions: RequestInit = {
      method: options.method || "GET",
      headers,
    }

    if (options.body) {
      requestOptions.body = JSON.stringify(options.body)
    }

    return requestOptions
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private minifyData(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.minifyData(item))
    }

    if (data && typeof data === "object") {
      const minified: any = {}
      for (const [key, value] of Object.entries(data)) {
        // Skip null/undefined values and empty strings
        if (value !== null && value !== undefined && value !== "") {
          // Truncate long text fields for mobile
          if (typeof value === "string" && value.length > 200) {
            minified[key] = value.substring(0, 200) + "..."
          } else {
            minified[key] = this.minifyData(value)
          }
        }
      }
      return minified
    }

    return data
  }

  // Analytics and monitoring
  getPerformanceMetrics() {
    return {
      cacheHitRate: this.calculateCacheHitRate(),
      offlineQueueSize: this.offlineQueue.length,
      cacheSize: this.cache.size,
      isOnline: this.isOnline,
    }
  }

  private calculateCacheHitRate(): number {
    // This would be implemented with proper tracking
    return 0.75 // Mock 75% cache hit rate
  }

  // Configuration management
  updateConfig(newConfig: Partial<MobileAPIConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): MobileAPIConfig {
    return { ...this.config }
  }
}

export const mobileAPIOptimizer = new MobileAPIOptimizer()
export type { MobileAPIConfig, APIResponse, BatchRequest }
