// Critical Issue #5: Missing Performance Monitoring
// Impact: No visibility into performance bottlenecks
// Solution: Comprehensive performance monitoring

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface PerformanceThresholds {
  warning: number
  critical: number
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private thresholds: Map<string, PerformanceThresholds> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    this.setupDefaultThresholds()
    this.initializeObservers()
  }

  private setupDefaultThresholds() {
    this.thresholds.set("api-response", { warning: 1000, critical: 3000 })
    this.thresholds.set("page-load", { warning: 2000, critical: 5000 })
    this.thresholds.set("component-render", { warning: 100, critical: 500 })
    this.thresholds.set("database-query", { warning: 500, critical: 2000 })
  }

  private initializeObservers() {
    if (typeof window === "undefined") return

    // Core Web Vitals monitoring
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.recordMetric("lcp", lastEntry.startTime, {
          element: lastEntry.element?.tagName,
          url: lastEntry.url,
        })
      })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
      this.observers.set("lcp", lcpObserver)

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.recordMetric("fid", entry.processingStart - entry.startTime, {
            eventType: entry.name,
          })
        })
      })
      fidObserver.observe({ entryTypes: ["first-input"] })
      this.observers.set("fid", fidObserver)

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.recordMetric("cls", clsValue)
      })
      clsObserver.observe({ entryTypes: ["layout-shift"] })
      this.observers.set("cls", clsObserver)
    } catch (error) {
      console.warn("Performance observers not supported:", error)
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    }

    this.metrics.push(metric)
    this.checkThresholds(metric)
    this.cleanupOldMetrics()

    // Send to analytics service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToAnalytics(metric)
    }
  }

  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.thresholds.get(metric.name)
    if (!threshold) return

    if (metric.value > threshold.critical) {
      console.error(`Critical performance issue: ${metric.name} took ${metric.value}ms`)
      this.alertCriticalPerformance(metric)
    } else if (metric.value > threshold.warning) {
      console.warn(`Performance warning: ${metric.name} took ${metric.value}ms`)
    }
  }

  private alertCriticalPerformance(metric: PerformanceMetric) {
    // In production, send alerts to monitoring service
    if (typeof window !== "undefined") {
      fetch("/api/performance-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metric),
      }).catch(() => {
        // Silently fail if alerting fails
      })
    }
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Send to analytics service (Google Analytics, DataDog, etc.)
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "performance_metric", {
        metric_name: metric.name,
        metric_value: metric.value,
        custom_map: metric.metadata,
      })
    }
  }

  private cleanupOldMetrics() {
    const cutoff = Date.now() - 3600000 // Keep metrics for 1 hour
    this.metrics = this.metrics.filter((metric) => metric.timestamp > cutoff)
  }

  // Utility methods for measuring performance
  startTimer(name: string): () => void {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration)
    }
  }

  async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now()
    try {
      const result = await operation()
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, { success: true })
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, { success: false, error: error.message })
      throw error
    }
  }

  getMetrics(name?: string, timeRange?: { start: number; end: number }): PerformanceMetric[] {
    let filtered = this.metrics

    if (name) {
      filtered = filtered.filter((metric) => metric.name === name)
    }

    if (timeRange) {
      filtered = filtered.filter((metric) => metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end)
    }

    return filtered
  }

  getAverageMetric(name: string, timeRange?: { start: number; end: number }): number {
    const metrics = this.getMetrics(name, timeRange)
    if (metrics.length === 0) return 0

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
    return sum / metrics.length
  }

  destroy() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
    this.metrics = []
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const recordRender = (renderTime: number) => {
    performanceMonitor.recordMetric(`component-render-${componentName}`, renderTime)
  }

  const measureOperation = (operationName: string) => {
    return performanceMonitor.startTimer(`${componentName}-${operationName}`)
  }

  return { recordRender, measureOperation }
}
