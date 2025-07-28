interface ApiError extends Error {
  status?: number
  code?: string
  details?: any
}

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number
  monitoringPeriod: number
}

class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED"

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = "HALF_OPEN"
      } else {
        throw new Error("Circuit breaker is OPEN")
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state = "CLOSED"
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.config.failureThreshold) {
      this.state = "OPEN"
    }
  }
}

class ApiClient {
  private baseUrl: string
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  }

  private circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 10000,
  })

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt)
    return Math.min(delay, config.maxDelay)
  }

  private isRetryableError(error: ApiError): boolean {
    if (!error.status) return true // Network errors
    return error.status >= 500 || error.status === 429 // Server errors or rate limiting
  }

  private createApiError(response: Response, data?: any): ApiError {
    const error = new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`) as ApiError
    error.status = response.status
    error.code = data?.code
    error.details = data
    return error
  }

  async request<T>(endpoint: string, options: RequestInit = {}, retryConfig: Partial<RetryConfig> = {}): Promise<T> {
    const config = { ...this.defaultRetryConfig, ...retryConfig }
    const url = `${this.baseUrl}${endpoint}`

    const executeRequest = async (): Promise<T> => {
      let lastError: ApiError

      for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...options.headers,
            },
          })

          if (!response.ok) {
            let errorData
            try {
              errorData = await response.json()
            } catch {
              // Response is not JSON
            }

            const apiError = this.createApiError(response, errorData)

            if (!this.isRetryableError(apiError) || attempt === config.maxRetries) {
              throw apiError
            }

            lastError = apiError
            const delay = this.calculateDelay(attempt, config)
            await this.delay(delay)
            continue
          }

          const data = await response.json()
          return data
        } catch (error) {
          if (error instanceof TypeError) {
            // Network error
            lastError = new Error("Network error: Please check your connection") as ApiError
          } else {
            lastError = error as ApiError
          }

          if (attempt === config.maxRetries) {
            throw lastError
          }

          if (this.isRetryableError(lastError)) {
            const delay = this.calculateDelay(attempt, config)
            await this.delay(delay)
          } else {
            throw lastError
          }
        }
      }

      throw lastError!
    }

    return this.circuitBreaker.execute(executeRequest)
  }

  async get<T>(endpoint: string, retryConfig?: Partial<RetryConfig>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, retryConfig)
  }

  async post<T>(endpoint: string, data?: any, retryConfig?: Partial<RetryConfig>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      retryConfig,
    )
  }

  async put<T>(endpoint: string, data?: any, retryConfig?: Partial<RetryConfig>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      retryConfig,
    )
  }

  async delete<T>(endpoint: string, retryConfig?: Partial<RetryConfig>): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, retryConfig)
  }
}

export const apiClient = new ApiClient()

// Utility function for handling API errors in components
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    const apiError = error as ApiError

    if (apiError.status === 400) {
      return apiError.details?.message || "Invalid request. Please check your input."
    }

    if (apiError.status === 401) {
      return "You are not authorized to perform this action."
    }

    if (apiError.status === 403) {
      return "Access denied. You do not have permission to perform this action."
    }

    if (apiError.status === 404) {
      return "The requested resource was not found."
    }

    if (apiError.status === 429) {
      return "Too many requests. Please try again later."
    }

    if (apiError.status && apiError.status >= 500) {
      return "Server error. Please try again later."
    }

    if (apiError.message.includes("Network error")) {
      return "Network error. Please check your internet connection."
    }

    if (apiError.message.includes("Circuit breaker is OPEN")) {
      return "Service temporarily unavailable. Please try again in a few minutes."
    }

    return apiError.message || "An unexpected error occurred."
  }

  return "An unexpected error occurred."
}
