// Global error handler and monitoring utilities

interface ErrorLog {
  id: string
  message: string
  stack?: string
  timestamp: string
  url: string
  userAgent: string
  userId?: string
  type: "javascript" | "unhandled-rejection" | "network" | "custom"
  severity: "low" | "medium" | "high" | "critical"
  context?: Record<string, any>
}

class ErrorHandler {
  private static instance: ErrorHandler
  private errors: ErrorLog[] = []
  private maxErrors = 50

  private constructor() {
    this.setupGlobalHandlers()
    this.loadStoredErrors()
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  private setupGlobalHandlers() {
    if (typeof window === "undefined") return

    // Handle unhandled JavaScript errors
    window.addEventListener("error", (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        type: "javascript",
        severity: "high",
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      })
    })

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        type: "unhandled-rejection",
        severity: "high",
        context: {
          reason: event.reason,
        },
      })
    })

    // Handle network errors (basic detection)
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        if (!response.ok) {
          this.logError({
            message: `Network Error: ${response.status} ${response.statusText}`,
            type: "network",
            severity: response.status >= 500 ? "high" : "medium",
            context: {
              url: args[0],
              status: response.status,
              statusText: response.statusText,
            },
          })
        }
        return response
      } catch (error) {
        this.logError({
          message: `Network Error: ${error}`,
          stack: error instanceof Error ? error.stack : undefined,
          type: "network",
          severity: "high",
          context: {
            url: args[0],
            error: error instanceof Error ? error.message : String(error),
          },
        })
        throw error
      }
    }
  }

  private loadStoredErrors() {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem("app_errors")
      if (stored) {
        const parsedErrors = JSON.parse(stored)
        this.errors = Array.isArray(parsedErrors) ? parsedErrors : []
      }
    } catch (error) {
      console.error("[v0] Failed to load stored errors:", error)
    }
  }

  private saveErrors() {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("app_errors", JSON.stringify(this.errors.slice(-this.maxErrors)))
    } catch (error) {
      console.error("[v0] Failed to save errors:", error)
    }
  }

  logError(errorData: Partial<ErrorLog>) {
    const error: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: errorData.message || "Unknown error",
      stack: errorData.stack,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "unknown",
      type: errorData.type || "custom",
      severity: errorData.severity || "medium",
      context: errorData.context,
    }

    this.errors.push(error)

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    this.saveErrors()

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[v0] Error logged:", error)
    }

    // In production, you would send to monitoring service
    // this.sendToMonitoringService(error)
  }

  getErrors(): ErrorLog[] {
    return [...this.errors]
  }

  getErrorsByType(type: ErrorLog["type"]): ErrorLog[] {
    return this.errors.filter((error) => error.type === type)
  }

  getErrorsBySeverity(severity: ErrorLog["severity"]): ErrorLog[] {
    return this.errors.filter((error) => error.severity === severity)
  }

  clearErrors() {
    this.errors = []
    this.saveErrors()
  }

  getErrorStats() {
    const total = this.errors.length
    const byType = this.errors.reduce(
      (acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const bySeverity = this.errors.reduce(
      (acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return { total, byType, bySeverity }
  }
}

// Initialize global error handler
export const errorHandler = ErrorHandler.getInstance()

// Utility function for manual error logging
export const logError = (message: string, context?: Record<string, any>, severity: ErrorLog["severity"] = "medium") => {
  errorHandler.logError({
    message,
    type: "custom",
    severity,
    context,
  })
}

// Health check utilities
export const healthCheck = {
  async checkAPI(): Promise<boolean> {
    try {
      const response = await fetch("/api/health", { method: "GET" })
      return response.ok
    } catch {
      return false
    }
  },

  async checkDatabase(): Promise<boolean> {
    try {
      const response = await fetch("/api/health/database", { method: "GET" })
      return response.ok
    } catch {
      return false
    }
  },

  checkLocalStorage(): boolean {
    try {
      const test = "test"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  async runFullCheck() {
    const results = {
      api: await this.checkAPI(),
      database: await this.checkDatabase(),
      localStorage: this.checkLocalStorage(),
      timestamp: new Date().toISOString(),
    }

    if (!results.api || !results.database || !results.localStorage) {
      logError("Health check failed", results, "high")
    }

    return results
  },
}
