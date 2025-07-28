"use client"

// Comprehensive error tracking and monitoring system
interface ErrorContext {
  userId?: string
  sessionId: string
  userAgent: string
  url: string
  timestamp: string
  buildVersion?: string
  environment: string
  additionalData?: Record<string, any>
}

interface ErrorReport {
  id: string
  message: string
  stack?: string
  type: "javascript" | "network" | "api" | "validation" | "security"
  severity: "low" | "medium" | "high" | "critical"
  context: ErrorContext
  fingerprint: string
  count: number
  firstSeen: string
  lastSeen: string
  resolved: boolean
  tags: string[]
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  context: ErrorContext
}

class ErrorTracker {
  private static instance: ErrorTracker
  private sessionId: string
  private userId?: string
  private errorQueue: ErrorReport[] = []
  private performanceQueue: PerformanceMetric[] = []
  private isOnline = true
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupGlobalErrorHandlers()
    this.setupPerformanceMonitoring()
    this.setupNetworkMonitoring()
    this.startPeriodicFlush()
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  setUser(userId: string, additionalData?: Record<string, any>): void {
    this.userId = userId
    this.captureEvent("user_identified", {
      userId,
      ...additionalData,
    })
  }

  captureError(
    error: Error | string,
    context?: Partial<ErrorContext>,
    severity: ErrorReport["severity"] = "medium",
  ): string {
    const errorMessage = typeof error === "string" ? error : error.message
    const stack = typeof error === "object" ? error.stack : undefined

    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: errorMessage,
      stack,
      type: this.determineErrorType(error, context),
      severity,
      context: this.buildContext(context),
      fingerprint: this.generateFingerprint(errorMessage, stack),
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      resolved: false,
      tags: this.extractTags(error, context),
    }

    this.addToQueue(errorReport)
    this.notifyIfCritical(errorReport)

    return errorReport.id
  }

  captureException(error: Error, context?: Partial<ErrorContext>): string {
    return this.captureError(error, context, "high")
  }

  captureMessage(message: string, level: "info" | "warning" | "error" = "info"): string {
    const severity = level === "error" ? "medium" : level === "warning" ? "low" : "low"
    return this.captureError(message, { additionalData: { level } }, severity)
  }

  captureEvent(eventName: string, data?: Record<string, any>): void {
    const event = {
      name: eventName,
      data,
      timestamp: new Date().toISOString(),
      context: this.buildContext(),
    }

    // Send event to analytics
    this.sendEvent(event)
  }

  capturePerformanceMetric(name: string, value: number, unit = "ms"): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      context: this.buildContext(),
    }

    this.performanceQueue.push(metric)
  }

  addBreadcrumb(message: string, category = "default", data?: Record<string, any>): void {
    const breadcrumb = {
      message,
      category,
      data,
      timestamp: new Date().toISOString(),
      level: "info",
    }

    // Store breadcrumbs in session storage for context
    const breadcrumbs = this.getBreadcrumbs()
    breadcrumbs.push(breadcrumb)

    // Keep only last 50 breadcrumbs
    if (breadcrumbs.length > 50) {
      breadcrumbs.shift()
    }

    sessionStorage.setItem("error_breadcrumbs", JSON.stringify(breadcrumbs))
  }

  setTag(key: string, value: string): void {
    const tags = this.getTags()
    tags[key] = value
    sessionStorage.setItem("error_tags", JSON.stringify(tags))
  }

  setContext(key: string, value: any): void {
    const contexts = this.getContexts()
    contexts[key] = value
    sessionStorage.setItem("error_contexts", JSON.stringify(contexts))
  }

  private setupGlobalErrorHandlers(): void {
    // JavaScript errors
    window.addEventListener("error", (event) => {
      this.captureError(
        event.error || event.message,
        {
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            type: "javascript",
          },
        },
        "high",
      )
    })

    // Promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.captureError(
        event.reason,
        {
          additionalData: {
            type: "unhandled_promise_rejection",
          },
        },
        "high",
      )
    })

    // React error boundary integration
    if (typeof window !== "undefined") {
      ;(window as any).__ERROR_TRACKER__ = this
    }
  }

  private setupPerformanceMonitoring(): void {
    // Web Vitals
    if ("web-vital" in window) {
      this.measureWebVitals()
    }

    // Navigation timing
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming

        if (navigation) {
          this.capturePerformanceMetric("page_load_time", navigation.loadEventEnd - navigation.fetchStart)
          this.capturePerformanceMetric(
            "dom_content_loaded",
            navigation.domContentLoadedEventEnd - navigation.fetchStart,
          )
          this.capturePerformanceMetric("first_byte", navigation.responseStart - navigation.fetchStart)
        }
      }, 0)
    })

    // Resource timing
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "resource") {
          const resource = entry as PerformanceResourceTiming
          this.capturePerformanceMetric(`resource_${resource.name}`, resource.duration)
        }
      })
    })

    observer.observe({ entryTypes: ["resource"] })
  }

  private setupNetworkMonitoring(): void {
    // Monitor online/offline status
    window.addEventListener("online", () => {
      this.isOnline = true
      this.captureEvent("network_online")
      this.flushQueue()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      this.captureEvent("network_offline")
    })

    // Intercept fetch requests for API monitoring
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const url = typeof args[0] === "string" ? args[0] : args[0].url

      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - startTime

        this.capturePerformanceMetric(`api_${url}`, duration)

        if (!response.ok) {
          this.captureError(
            `API Error: ${response.status} ${response.statusText}`,
            {
              additionalData: {
                url,
                status: response.status,
                method: args[1]?.method || "GET",
                type: "api",
              },
            },
            response.status >= 500 ? "high" : "medium",
          )
        }

        return response
      } catch (error) {
        const duration = performance.now() - startTime
        this.capturePerformanceMetric(`api_${url}_failed`, duration)

        this.captureError(
          error as Error,
          {
            additionalData: {
              url,
              method: args[1]?.method || "GET",
              type: "network",
            },
          },
          "high",
        )

        throw error
      }
    }
  }

  private measureWebVitals(): void {
    // This would integrate with web-vitals library
    // For now, we'll use basic performance measurements

    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.capturePerformanceMetric("largest_contentful_paint", lastEntry.startTime)
    })

    observer.observe({ entryTypes: ["largest-contentful-paint"] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.capturePerformanceMetric("first_input_delay", entry.processingStart - entry.startTime)
      })
    })

    fidObserver.observe({ entryTypes: ["first-input"] })
  }

  private buildContext(additionalContext?: Partial<ErrorContext>): ErrorContext {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION,
      environment: process.env.NODE_ENV || "development",
      ...additionalContext,
    }
  }

  private determineErrorType(error: Error | string, context?: Partial<ErrorContext>): ErrorReport["type"] {
    if (context?.additionalData?.type) {
      return context.additionalData.type
    }

    const message = typeof error === "string" ? error : error.message

    if (message.includes("fetch") || message.includes("network")) {
      return "network"
    }

    if (message.includes("API") || message.includes("HTTP")) {
      return "api"
    }

    if (message.includes("validation") || message.includes("invalid")) {
      return "validation"
    }

    if (message.includes("unauthorized") || message.includes("forbidden")) {
      return "security"
    }

    return "javascript"
  }

  private generateFingerprint(message: string, stack?: string): string {
    const content = stack || message
    // Simple hash function for fingerprinting
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  private extractTags(error: Error | string, context?: Partial<ErrorContext>): string[] {
    const tags: string[] = []

    if (context?.additionalData?.type) {
      tags.push(`type:${context.additionalData.type}`)
    }

    if (this.userId) {
      tags.push(`user:${this.userId}`)
    }

    tags.push(`environment:${process.env.NODE_ENV || "development"}`)

    // Add custom tags from session storage
    const customTags = this.getTags()
    Object.entries(customTags).forEach(([key, value]) => {
      tags.push(`${key}:${value}`)
    })

    return tags
  }

  private addToQueue(errorReport: ErrorReport): void {
    // Check if similar error already exists in queue
    const existingIndex = this.errorQueue.findIndex((existing) => existing.fingerprint === errorReport.fingerprint)

    if (existingIndex !== -1) {
      // Update existing error
      this.errorQueue[existingIndex].count++
      this.errorQueue[existingIndex].lastSeen = errorReport.lastSeen
    } else {
      // Add new error
      this.errorQueue.push(errorReport)
    }

    // Flush if queue is getting large
    if (this.errorQueue.length >= 10) {
      this.flushQueue()
    }
  }

  private notifyIfCritical(errorReport: ErrorReport): void {
    if (errorReport.severity === "critical") {
      // Send immediate notification
      this.sendImmediateAlert(errorReport)
    }
  }

  private async sendImmediateAlert(errorReport: ErrorReport): Promise<void> {
    try {
      await fetch("/api/errors/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      })
    } catch (error) {
      console.error("Failed to send immediate alert:", error)
    }
  }

  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flushQueue()
    }, 30000) // Flush every 30 seconds
  }

  private async flushQueue(): Promise<void> {
    if (!this.isOnline || (this.errorQueue.length === 0 && this.performanceQueue.length === 0)) {
      return
    }

    const errors = [...this.errorQueue]
    const metrics = [...this.performanceQueue]

    this.errorQueue = []
    this.performanceQueue = []

    try {
      if (errors.length > 0) {
        await fetch("/api/errors/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            errors,
            breadcrumbs: this.getBreadcrumbs(),
            contexts: this.getContexts(),
          }),
        })
      }

      if (metrics.length > 0) {
        await fetch("/api/metrics/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ metrics }),
        })
      }
    } catch (error) {
      // Re-add to queue if failed to send
      this.errorQueue.unshift(...errors)
      this.performanceQueue.unshift(...metrics)
      console.error("Failed to flush error queue:", error)
    }
  }

  private async sendEvent(event: any): Promise<void> {
    try {
      await fetch("/api/analytics/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error("Failed to send event:", error)
    }
  }

  private getBreadcrumbs(): any[] {
    try {
      return JSON.parse(sessionStorage.getItem("error_breadcrumbs") || "[]")
    } catch {
      return []
    }
  }

  private getTags(): Record<string, string> {
    try {
      return JSON.parse(sessionStorage.getItem("error_tags") || "{}")
    } catch {
      return {}
    }
  }

  private getContexts(): Record<string, any> {
    try {
      return JSON.parse(sessionStorage.getItem("error_contexts") || "{}")
    } catch {
      return {}
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Cleanup method
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
  }
}

// React Error Boundary integration
export class ErrorBoundaryReporter {
  static captureError(error: Error, errorInfo: any): void {
    const tracker = ErrorTracker.getInstance()
    tracker.captureError(
      error,
      {
        additionalData: {
          componentStack: errorInfo.componentStack,
          type: "react_error_boundary",
        },
      },
      "high",
    )
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance()

// React hooks for error tracking
export function useErrorTracking() {
  return {
    captureError: errorTracker.captureError.bind(errorTracker),
    captureException: errorTracker.captureException.bind(errorTracker),
    captureMessage: errorTracker.captureMessage.bind(errorTracker),
    captureEvent: errorTracker.captureEvent.bind(errorTracker),
    addBreadcrumb: errorTracker.addBreadcrumb.bind(errorTracker),
    setTag: errorTracker.setTag.bind(errorTracker),
    setContext: errorTracker.setContext.bind(errorTracker),
    setUser: errorTracker.setUser.bind(errorTracker),
  }
}

// Performance monitoring hook
export function usePerformanceTracking() {
  return {
    captureMetric: errorTracker.capturePerformanceMetric.bind(errorTracker),
    measureFunction: <T extends (...args: any[]) => any>(fn: T, name: string): T => {
      return ((...args: any[]) => {
        const start = performance.now()
        const result = fn(...args)
        const duration = performance.now() - start
        errorTracker.capturePerformanceMetric(name, duration)
        return result
      }) as T
    },\
    measureAsync: async <T>(promise: Promise<T>, name: string): Promise<T> => {\
      const start = performance.now()\
      try {\
        const result = await promise\
        const duration = performance.now() - start\
        errorTracker.capturePerformanceMetric(name, duration)\
        return result\
      } catch (error) {
        const duration = performance.now() - start
        errorTracker.capturePerformanceMetric(`${name}_failed`, duration)
        throw error
      }
    }
}
\
}
