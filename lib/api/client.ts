// Enhanced API client with comprehensive error handling and retry logic
import { type ApiResponse, type PaginationParams, type FilterParams, type ApiError, API_ERROR_CODES } from "./types"

interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  skipAuth?: boolean
}

interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: number
}

class ApiClient {
  private baseUrl: string
  private defaultTimeout = 30000
  private defaultRetries = 3
  private defaultRetryDelay = 1000
  private rateLimitInfo: Map<string, RateLimitInfo> = new Map()
  private requestQueue: Map<string, Promise<any>> = new Map()

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  private async makeRequest<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      skipAuth = false,
      ...requestConfig
    } = config

    const url = `${this.baseUrl}${endpoint}`
    const requestId = crypto.randomUUID()

    // Check rate limiting
    await this.checkRateLimit(endpoint)

    // Deduplicate identical requests
    const cacheKey = `${requestConfig.method || "GET"}-${url}-${JSON.stringify(requestConfig.body)}`
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)
    }

    const requestPromise = this.executeRequest<T>(url, requestConfig, timeout, retries, retryDelay, requestId, skipAuth)

    this.requestQueue.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.requestQueue.delete(cacheKey)
    }
  }

  private async executeRequest<T>(
    url: string,
    config: RequestInit,
    timeout: number,
    retries: number,
    retryDelay: number,
    requestId: string,
    skipAuth: boolean,
  ): Promise<ApiResponse<T>> {
    let lastError: Error

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
          ...config.headers,
        }

        // Add authentication if not skipped
        if (!skipAuth) {
          const token = this.getAuthToken()
          if (token) {
            headers.Authorization = `Bearer ${token}`
          }
        }

        const response = await fetch(url, {
          ...config,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Update rate limit info
        this.updateRateLimitInfo(url, response)

        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response)
          const apiError = new Error(errorData.message) as ApiError
          apiError.code = errorData.code
          apiError.statusCode = response.status
          apiError.details = errorData.details

          // Don't retry client errors (4xx) except for rate limiting
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw apiError
          }

          if (attempt === retries) {
            throw apiError
          }

          lastError = apiError
          await this.delay(retryDelay * Math.pow(2, attempt))
          continue
        }

        const data = await response.json()
        return {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        }
      } catch (error) {
        lastError = error as Error

        if (error.name === "AbortError") {
          const timeoutError = new Error("Request timeout") as ApiError
          timeoutError.code = API_ERROR_CODES.SERVICE_UNAVAILABLE
          timeoutError.statusCode = 408
          throw timeoutError
        }

        if (attempt === retries) {
          break
        }

        await this.delay(retryDelay * Math.pow(2, attempt))
      }
    }

    // If we get here, all retries failed
    const networkError = new Error("Network error after retries") as ApiError
    networkError.code = API_ERROR_CODES.SERVICE_UNAVAILABLE
    networkError.statusCode = 0
    networkError.details = lastError?.message
    throw networkError
  }

  private async parseErrorResponse(response: Response) {
    try {
      const errorData = await response.json()
      return {
        code: errorData.error?.code || API_ERROR_CODES.INTERNAL_ERROR,
        message: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        details: errorData.error?.details,
      }
    } catch {
      return {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: `HTTP ${response.status}: ${response.statusText}`,
        details: null,
      }
    }
  }

  private getAuthToken(): string | null {
    // In a real app, this would get the token from localStorage, cookies, or auth context
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  }

  private updateRateLimitInfo(url: string, response: Response) {
    const limit = response.headers.get("X-RateLimit-Limit")
    const remaining = response.headers.get("X-RateLimit-Remaining")
    const reset = response.headers.get("X-RateLimit-Reset")

    if (limit && remaining && reset) {
      this.rateLimitInfo.set(url, {
        limit: Number.parseInt(limit),
        remaining: Number.parseInt(remaining),
        resetTime: Number.parseInt(reset) * 1000, // Convert to milliseconds
      })
    }
  }

  private async checkRateLimit(endpoint: string): Promise<void> {
    const rateLimitInfo = this.rateLimitInfo.get(endpoint)
    if (!rateLimitInfo) return

    if (rateLimitInfo.remaining <= 0 && Date.now() < rateLimitInfo.resetTime) {
      const waitTime = rateLimitInfo.resetTime - Date.now()
      await this.delay(waitTime)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Public API methods
  async get<T>(
    endpoint: string,
    params?: PaginationParams & FilterParams,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(this.serializeParams(params))}` : endpoint
    return this.makeRequest<T>(url, { ...config, method: "GET" })
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: "DELETE" })
  }

  private serializeParams(params: Record<string, any>): Record<string, string> {
    const serialized: Record<string, string> = {}

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          serialized[key] = value.join(",")
        } else {
          serialized[key] = String(value)
        }
      }
    })

    return serialized
  }

  // Utility methods
  getRateLimitInfo(endpoint: string): RateLimitInfo | null {
    return this.rateLimitInfo.get(endpoint) || null
  }

  clearCache(): void {
    this.requestQueue.clear()
  }

  setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Specialized API clients
export class BillsApi {
  private client = apiClient

  async getAll(params?: PaginationParams & FilterParams) {
    return this.client.get("/bills", params)
  }

  async getById(id: string) {
    return this.client.get(`/bills/${id}`)
  }

  async create(data: any) {
    return this.client.post("/bills", data)
  }

  async update(id: string, data: any) {
    return this.client.put(`/bills/${id}`, data)
  }

  async delete(id: string) {
    return this.client.delete(`/bills/${id}`)
  }

  async notifyPayment(id: string, data: any) {
    return this.client.post(`/bills/${id}/notify-payment`, data)
  }

  async generateQR(id: string) {
    return this.client.post(`/bills/${id}/generate-qr`)
  }
}

export class CustomersApi {
  private client = apiClient

  async getAll(params?: PaginationParams & FilterParams) {
    return this.client.get("/customers", params)
  }

  async getById(id: string) {
    return this.client.get(`/customers/${id}`)
  }

  async create(data: any) {
    return this.client.post("/customers", data)
  }

  async update(id: string, data: any) {
    return this.client.put(`/customers/${id}`, data)
  }

  async delete(id: string) {
    return this.client.delete(`/customers/${id}`)
  }
}

export class ProductsApi {
  private client = apiClient

  async getAll(params?: PaginationParams & FilterParams) {
    return this.client.get("/products", params)
  }

  async getById(id: string) {
    return this.client.get(`/products/${id}`)
  }

  async create(data: any) {
    return this.client.post("/products", data)
  }

  async update(id: string, data: any) {
    return this.client.put(`/products/${id}`, data)
  }

  async delete(id: string) {
    return this.client.delete(`/products/${id}`)
  }
}

export class AnalyticsApi {
  private client = apiClient

  async getDashboard(params?: { dateRange?: string }) {
    return this.client.get("/analytics/dashboard", params)
  }

  async getRevenue(params?: { startDate?: string; endDate?: string }) {
    return this.client.get("/analytics/revenue", params)
  }

  async getCustomerMetrics(params?: { period?: string }) {
    return this.client.get("/analytics/customers", params)
  }
}

// Export API instances
export const billsApi = new BillsApi()
export const customersApi = new CustomersApi()
export const productsApi = new ProductsApi()
export const analyticsApi = new AnalyticsApi()
