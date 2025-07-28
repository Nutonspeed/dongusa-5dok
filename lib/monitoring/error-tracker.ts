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
  private isInitialized = false
  private errorReportingEnabled = true

  constructor() {
    this.sessionId = this.generateSessionId()
    // Don't initialize immediately to prevent issues
    if (typeof window !== "undefined") {
      // Use setTimeout to defer initialization
      setTimeout(() => this.safeInitialize(), 100)
    }
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  private safeInitialize(): void {
    if (this.isInitialized) return

    try {
      this.setupGlobalErrorHandlers()
      this.setupNetworkMonitoring()
      this.startPeriodicFlush()
      this.isInitialized = true
    } catch (error) {
      console.error("Failed to initialize error tracker:", error)
      this.errorReportingEnabled = false
    }
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
    if (!this.errorReportingEnabled) return ""

    try {
      const errorMessage = typeof error === "string" ? error : error.message
      const stack = typeof error === "object" ? error.stack : undefined

      // Prevent recursive error reporting
      if (errorMessage.includes("ErrorTracker") || errorMessage.includes("error-tracker")) {
        return ""
      }

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
    } catch (err) {
      console.error("Error in captureError:", err)
      return ""
    }
  }

  captureException(error: Error, context?: Partial<ErrorContext>): string {
    return this.captureError(error, context, "high")
  }

  captureMessage(message: string, level: "info" | "warning" | "error" = "info"): string {
    const severity = level === "error" ? "medium" : level === "warning" ? "low" : "low"
    return this.captureError(message, { additionalData: { level } }, severity)
  }

  captureEvent(eventName: string, data?: Record<string, any>): void {
    if (!this.errorReportingEnabled) return

    try {
      const event = {
        name: eventName,
        data,
        timestamp: new Date().toISOString(),
        context: this.buildContext(),
      }

      // Send event to analytics (non-blocking)
      this.sendEvent(event).catch(() => {
        // Silently fail to prevent recursive errors
      })
    } catch (error) {
      // Silently fail to prevent recursive errors
    }
  }

  capturePerformanceMetric(name: string, value: number, unit = "ms"): void {
    if (!this.errorReportingEnabled || !isFinite(value) || value < 0) return

    try {
      const metric: PerformanceMetric = {
        name,
        value,
        unit,
        timestamp: new Date().toISOString(),
        context: this.buildContext(),
      }

      this.performanceQueue.push(metric)

      // Limit queue size
      if (this.performanceQueue.length > 100) {
        this.performanceQueue = this.performanceQueue.slice(-50)
      }
    } catch (error) {
      // Silently fail
    }
  }

  addBreadcrumb(message: string, category = "default", data?: Record<string, any>): void {
    if (!this.errorReportingEnabled) return

    try {
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

      // Keep only last 20 breadcrumbs (reduced from 50)
      if (breadcrumbs.length > 20) {
        breadcrumbs.shift()
      }

      sessionStorage.setItem("error_breadcrumbs", JSON.stringify(breadcrumbs))
    } catch (error) {
      // Silently fail if sessionStorage is not available
    }
  }

  setTag(key: string, value: string): void {
    if (!this.errorReportingEnabled) return

    try {
      const tags = this.getTags()
      tags[key] = value
      sessionStorage.setItem("error_tags", JSON.stringify(tags))
    } catch (error) {
      // Silently fail
    }
  }

  setContext(key: string, value: any): void {
    if (!this.errorReportingEnabled) return

    try {
      const contexts = this.getContexts()
      contexts[key] = value
      sessionStorage.setItem("error_contexts", JSON.stringify(contexts))
    } catch (error) {
      // Silently fail
    }
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === "undefined") return

    // JavaScript errors
    window.addEventListener(
      "error",
      (event) => {
        // Prevent infinite loops
        if (event.filename?.includes("error-tracker") || event.message?.includes("ErrorTracker")) {
          return
        }

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
      },
      { passive: true },
    )

    // Promise rejections
    window.addEventListener(
      "unhandledrejection",
      (event) => {
        // Prevent infinite loops
        if (event.reason?.message?.includes("ErrorTracker")) {
          return
        }

        this.captureError(
          event.reason,
          {
            additionalData: {
              type: "unhandled_promise_rejection",
            },
          },
          "high",
        )
      },
      { passive: true },
    )

    // React error boundary integration
    if (typeof window !== "undefined") {
      ;(window as any).__ERROR_TRACKER__ = this
    }
  }

  private setupNetworkMonitoring(): void {
    if (typeof window === "undefined") return

    // Monitor online/offline status
    window.addEventListener(
      "online",
      () => {
        this.isOnline = true
        this.captureEvent("network_online")
        this.flushQueue()
      },
      { passive: true },
    )

    window.addEventListener(
      "offline",
      () => {
        this.isOnline = false
        this.captureEvent("network_offline")
      },
      { passive: true },
    )

    // Simplified fetch monitoring to prevent issues
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const url = typeof args[0] === "string" ? args[0] : args[0].url

      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - startTime

        // Only track if duration is reasonable
        if (isFinite(duration) && duration > 0 && duration < 60000) {
          this.capturePerformanceMetric(`api_${this.sanitizeUrl(url)}`, duration)
        }

        if (!response.ok && response.status >= 400) {
          this.captureError(
            `API Error: ${response.status} ${response.statusText}`,
            {
              additionalData: {
                url: this.sanitizeUrl(url),
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

        if (isFinite(duration) && duration > 0 && duration < 60000) {
          this.capturePerformanceMetric(`api_${this.sanitizeUrl(url)}_failed`, duration)
        }

        this.captureError(
          error as Error,
          {
            additionalData: {
              url: this.sanitizeUrl(url),
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

  private sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url)
      return parsed.pathname.replace(/[^a-zA-Z0-9/_-]/g, "_").substring(0, 50)
    } catch {
      return "unknown"
    }
  }

  private buildContext(additionalContext?: Partial<ErrorContext>): ErrorContext {
    try {
      return {
        userId: this.userId,
        sessionId: this.sessionId,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
        timestamp: new Date().toISOString(),
        buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION,
        environment: process.env.NODE_ENV || "development",
        ...additionalContext,
      }
    } catch {
      return {
        userId: this.userId,
        sessionId: this.sessionId,
        userAgent: "unknown",
        url: "unknown",
        timestamp: new Date().toISOString(),
        buildVersion: "unknown",
        environment: "unknown",
        ...additionalContext,
      }
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
    const content = (stack || message).substring(0, 200) // Limit content length
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  private extractTags(error: Error | string, context?: Partial<ErrorContext>): string[] {
    const tags: string[] = []

    try {
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
        if (tags.length < 10) {
          // Limit number of tags
          tags.push(`${key}:${value}`)
        }
      })
    } catch {
      // Silently fail
    }

    return tags
  }

  private addToQueue(errorReport: ErrorReport): void {
    try {
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

      // Limit queue size
      if (this.errorQueue.length > 50) {
        this.errorQueue = this.errorQueue.slice(-25)
      }

      // Flush if queue is getting large
      if (this.errorQueue.length >= 10) {
        this.flushQueue()
      }
    } catch (error) {
      // Silently fail
    }
  }

  private notifyIfCritical(errorReport: ErrorReport): void {
    if (errorReport.severity === "critical") {
      // Send immediate notification (non-blocking)
      this.sendImmediateAlert(errorReport).catch(() => {
        // Silently fail
      })
    }
  }

  private async sendImmediateAlert(errorReport: ErrorReport): Promise<void> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      await fetch("/api/errors/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
    } catch (error) {
      // Silently fail
    }
  }

  private startPeriodicFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }

    this.flushInterval = setInterval(() => {
      this.flushQueue()
    }, 60000) // Flush every 60 seconds (increased from 30)
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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const promises = []

      if (errors.length > 0) {
        promises.push(
          fetch("/api/errors/batch", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              errors,
              breadcrumbs: this.getBreadcrumbs(),
              contexts: this.getContexts(),
            }),
            signal: controller.signal,
          }),
        )
      }

      if (metrics.length > 0) {
        promises.push(
          fetch("/api/metrics/batch", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ metrics }),
            signal: controller.signal,
          }),
        )
      }

      await Promise.allSettled(promises)
      clearTimeout(timeoutId)
    } catch (error) {
      // Re-add to queue if failed to send (but limit size)
      this.errorQueue.unshift(...errors.slice(0, 10))
      this.performanceQueue.unshift(...metrics.slice(0, 20))
    }
  }

  private async sendEvent(event: any): Promise<void> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      await fetch("/api/analytics/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
    } catch (error) {
      // Silently fail
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
    this.errorReportingEnabled = false

    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }

    // Clear queues
    this.errorQueue = []
    this.performanceQueue = []
  }
}

// React Error Boundary integration
export class ErrorBoundaryReporter {
  static captureError(error: Error, errorInfo: any): void {
    try {
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
    } catch {
      // Silently fail
    }
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
        let result
        try {
          result = fn(...args)
          const duration = performance.now() - start
          if (isFinite(duration) && duration > 0) {
            errorTracker.capturePerformanceMetric(name, duration)
          }
          return result
        } catch (error) {
          const duration = performance.now() - start
          if (isFinite(duration) && duration > 0) {
            errorTracker.capturePerformanceMetric(`${name}_failed`, duration)
          }
          throw error
        }
      }) as T
    },\
    measureAsync: async <T>(promise: Promise<T>, name: string): Promise<T> => {\
      const start = performance.now()\
      const result = await promise\
      const duration = performance.now() - start\
      if (isFinite(duration) && duration > 0) {\
        errorTracker.capturePerformanceMetric(name, duration)
      }
  return result
  \
}
,
  }
}
