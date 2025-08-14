interface CRMClientConfig {
  baseURL: string
  apiKey: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

interface APIResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class CRMServiceClient {
  private config: CRMClientConfig
  private baseHeaders: Record<string, string>

  constructor(config: Partial<CRMClientConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || process.env.CRM_SERVICE_URL || "http://localhost:3001/api/v1/crm",
      apiKey: config.apiKey || process.env.CRM_API_KEY || "",
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    }

    this.baseHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
    }
  }

  // Customer Management Methods
  async getCustomers(
    params: {
      page?: number
      limit?: number
      segment?: string
      search?: string
    } = {},
  ): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })

    const response = await this.makeRequest<PaginatedResponse<any>>("GET", `/customers?${queryParams.toString()}`)
    return response.data
  }

  async getCustomer(customerId: string): Promise<any> {
    const response = await this.makeRequest<any>("GET", `/customers/${customerId}`)
    return response.data
  }

  async updateCustomer(customerId: string, updates: any): Promise<any> {
    const response = await this.makeRequest<any>("PUT", `/customers/${customerId}`, updates)
    return response.data
  }

  async addCustomerToSegments(customerId: string, segments: string[]): Promise<boolean> {
    const response = await this.makeRequest<{ success: boolean }>("POST", `/customers/${customerId}/segments`, {
      segments,
    })
    return response.data.success
  }

  // Customer Segmentation Methods
  async getSegments(): Promise<any[]> {
    const response = await this.makeRequest<{ segments: any[] }>("GET", "/segments")
    return response.data.segments
  }

  async createSegment(segmentData: any): Promise<any> {
    const response = await this.makeRequest<any>("POST", "/segments", segmentData)
    return response.data
  }

  async getSegmentCustomers(segmentId: string, page = 1): Promise<PaginatedResponse<any>> {
    const response = await this.makeRequest<PaginatedResponse<any>>(
      "GET",
      `/segments/${segmentId}/customers?page=${page}`,
    )
    return response.data
  }

  // Customer Journey Methods
  async getCustomerJourney(customerId: string): Promise<any> {
    const response = await this.makeRequest<any>("GET", `/customers/${customerId}/journey`)
    return response.data
  }

  async getCustomerInteractions(customerId: string, params: { type?: string; limit?: number } = {}): Promise<any> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })

    const response = await this.makeRequest<{ interactions: any[] }>(
      "GET",
      `/customers/${customerId}/interactions?${queryParams.toString()}`,
    )
    return response.data.interactions
  }

  async recordCustomerInteraction(customerId: string, interactionData: any): Promise<any> {
    const response = await this.makeRequest<any>("POST", `/customers/${customerId}/interactions`, interactionData)
    return response.data
  }

  // Analytics Methods
  async getSegmentAnalytics(dateRange?: string): Promise<any> {
    const params = dateRange ? `?date_range=${dateRange}` : ""
    const response = await this.makeRequest<any>("GET", `/analytics/segments${params}`)
    return response.data
  }

  async getCustomerLifetimeValue(params: { segment?: string; period?: string } = {}): Promise<any> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })

    const response = await this.makeRequest<any>("GET", `/analytics/customer-lifetime-value?${queryParams.toString()}`)
    return response.data
  }

  async getChurnPrediction(): Promise<any> {
    const response = await this.makeRequest<any>("GET", "/analytics/churn-prediction")
    return response.data
  }

  // Health Check
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy"
    checks: any[]
    uptime: number
    version: string
  }> {
    try {
      const response = await this.makeRequest<any>("GET", "/health")
      return response.data
    } catch (error) {
      return {
        status: "unhealthy",
        checks: [],
        uptime: 0,
        version: "unknown",
      }
    }
  }

  // Private helper methods
  private async makeRequest<T>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    endpoint: string,
    body?: any,
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`
    let attempt = 0

    while (attempt < this.config.retryAttempts) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

        const requestOptions: RequestInit = {
          method,
          headers: this.baseHeaders,
          signal: controller.signal,
        }

        if (body && method !== "GET") {
          requestOptions.body = JSON.stringify(body)
        }

        const response = await fetch(url, requestOptions)
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return {
          data,
          success: true,
        }
      } catch (error) {
        attempt++
        console.error(`CRM Service request failed (attempt ${attempt}):`, error)

        if (attempt >= this.config.retryAttempts) {
          throw new CRMServiceError(`Failed after ${this.config.retryAttempts} attempts: ${error.message}`, error)
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay * attempt))
      }
    }

    throw new CRMServiceError("Unexpected error in makeRequest")
  }

  // Configuration methods
  updateConfig(updates: Partial<CRMClientConfig>): void {
    this.config = { ...this.config, ...updates }
    this.baseHeaders.Authorization = `Bearer ${this.config.apiKey}`
  }

  getConfig(): CRMClientConfig {
    return { ...this.config }
  }
}

class CRMServiceError extends Error {
  public originalError?: Error

  constructor(message: string, originalError?: Error) {
    super(message)
    this.name = "CRMServiceError"
    this.originalError = originalError
  }
}

// Singleton instance for easy usage
export const crmClient = new CRMServiceClient()

// Factory function for creating configured clients
export function createCRMClient(config: Partial<CRMClientConfig>): CRMServiceClient {
  return new CRMServiceClient(config)
}

export { CRMServiceClient, CRMServiceError }
export type { CRMClientConfig, APIResponse, PaginatedResponse }
