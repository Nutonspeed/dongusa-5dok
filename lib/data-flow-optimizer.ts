// Enhanced data flow management with caching and optimization

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

interface QueryMetrics {
  queryCount: number
  totalTime: number
  averageTime: number
  errors: number
}

export class DataFlowManager {
  private cache = new Map<string, CacheEntry<any>>()
  private queryMetrics = new Map<string, QueryMetrics>()
  private subscribers = new Map<string, Set<(data: any) => void>>()

  // Cache management
  set<T>(key: string, data: T, ttl = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  // Reactive data subscriptions
  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }

    this.subscribers.get(key)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(key)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          this.subscribers.delete(key)
        }
      }
    }
  }

  // Notify subscribers of data changes
  notify(key: string, data: any): void {
    this.set(key, data)
    const subscribers = this.subscribers.get(key)
    if (subscribers) {
      subscribers.forEach((callback) => callback(data))
    }
  }

  // Query performance tracking
  async trackQuery<T>(queryName: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now()

    try {
      const result = await operation()
      const duration = performance.now() - startTime

      this.updateQueryMetrics(queryName, duration, false)
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.updateQueryMetrics(queryName, duration, true)
      throw error
    }
  }

  private updateQueryMetrics(queryName: string, duration: number, isError: boolean): void {
    const existing = this.queryMetrics.get(queryName) || {
      queryCount: 0,
      totalTime: 0,
      averageTime: 0,
      errors: 0,
    }

    existing.queryCount++
    existing.totalTime += duration
    existing.averageTime = existing.totalTime / existing.queryCount

    if (isError) {
      existing.errors++
    }

    this.queryMetrics.set(queryName, existing)
  }

  // Get performance insights
  getQueryMetrics(): Record<string, QueryMetrics> {
    return Object.fromEntries(this.queryMetrics.entries())
  }

  // Cache cleanup
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const dataFlowManager = new DataFlowManager()

// Optimized API client with intelligent caching
export class OptimizedApiClient {
  private baseUrl: string
  private requestQueue = new Map<string, Promise<any>>()

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  // Deduplicate identical requests
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`

    // Check cache first
    const cached = dataFlowManager.get<T>(cacheKey)
    if (cached && options.method === "GET") {
      return cached
    }

    // Check if identical request is in flight
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)
    }

    // Make new request
    const requestPromise = this.executeRequest<T>(endpoint, options, cacheKey)
    this.requestQueue.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.requestQueue.delete(cacheKey)
    }
  }

  private async executeRequest<T>(endpoint: string, options: RequestInit, cacheKey: string): Promise<T> {
    return dataFlowManager.trackQuery(`api-${endpoint}`, async () => {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Cache GET requests
      if (options.method === "GET" || !options.method) {
        dataFlowManager.set(cacheKey, data, 300000) // 5 minutes
      }

      return data
    })
  }

  // Batch requests for efficiency
  async batchRequest<T>(requests: Array<{ endpoint: string; options?: RequestInit }>): Promise<T[]> {
    const promises = requests.map(({ endpoint, options }) => this.request<T>(endpoint, options))

    return Promise.all(promises)
  }
}

export const optimizedApiClient = new OptimizedApiClient()
