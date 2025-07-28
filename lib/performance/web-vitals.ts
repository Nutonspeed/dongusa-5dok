"use client"

// Simplified Web Vitals monitoring to prevent browser lockup
interface WebVitalMetric {
  name: "CLS" | "FID" | "FCP" | "LCP" | "TTFB" | "INP"
  value: number
  rating: "good" | "needs-improvement" | "poor"
  delta: number
  id: string
  navigationType: string
}

interface PerformanceConfig {
  reportAllChanges?: boolean
  enableLogging?: boolean
  sampleRate?: number
  endpoint?: string
}

class WebVitalsMonitor {
  private config: PerformanceConfig
  private metrics: Map<string, WebVitalMetric> = new Map()
  private observers: PerformanceObserver[] = []
  private isInitialized = false
  private isDestroyed = false

  constructor(config: PerformanceConfig = {}) {
    this.config = {
      reportAllChanges: false,
      enableLogging: false, // Disabled by default to prevent spam
      sampleRate: 0.1, // Reduced sample rate
      endpoint: "/api/metrics/web-vitals",
      ...config,
    }

    // Defer initialization to prevent blocking
    if (typeof window !== "undefined") {
      setTimeout(() => this.safeInitialize(), 1000)
    }
  }

  private safeInitialize(): void {
    if (this.isInitialized || this.isDestroyed) return

    try {
      // Sample rate check
      if (Math.random() > this.config.sampleRate!) return

      this.measureBasicMetrics()
      this.setupBeforeUnload()
      this.isInitialized = true
    } catch (error) {
      console.error("Failed to initialize web vitals monitor:", error)
    }
  }

  private measureBasicMetrics(): void {
    if (typeof window === "undefined" || this.isDestroyed) return

    try {
      // Measure TTFB from navigation timing
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      if (navigation) {
        const ttfbValue = navigation.responseStart - navigation.fetchStart
        if (isFinite(ttfbValue) && ttfbValue > 0 && ttfbValue < 30000) {
          this.reportMetric({
            name: "TTFB",
            value: ttfbValue,
            rating: this.getTTFBRating(ttfbValue),
            delta: ttfbValue,
            id: this.generateId(),
            navigationType: this.getNavigationType(),
          })
        }
      }

      // Measure paint metrics
      this.measurePaintMetrics()

      // Measure layout shift (simplified)
      this.measureCLS()
    } catch (error) {
      // Silently fail
    }
  }

  private measurePaintMetrics(): void {
    try {
      const paintEntries = performance.getEntriesByType("paint")

      paintEntries.forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          const fcpValue = entry.startTime
          if (isFinite(fcpValue) && fcpValue > 0 && fcpValue < 30000) {
            this.reportMetric({
              name: "FCP",
              value: fcpValue,
              rating: this.getFCPRating(fcpValue),
              delta: fcpValue,
              id: this.generateId(),
              navigationType: this.getNavigationType(),
            })
          }
        }
      })
    } catch (error) {
      // Silently fail
    }
  }

  private measureCLS(): void {
    if (this.isDestroyed) return

    try {
      let clsValue = 0
      let entryCount = 0
      const maxEntries = 50 // Limit entries to prevent memory issues

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (this.isDestroyed || entryCount >= maxEntries) {
          observer.disconnect()
          return
        }

        for (const entry of entries) {
          if (entryCount >= maxEntries) break

          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            entryCount++
          }
        }

        if (clsValue > 0) {
          this.reportMetric({
            name: "CLS",
            value: clsValue,
            rating: this.getCLSRating(clsValue),
            delta: clsValue,
            id: this.generateId(),
            navigationType: this.getNavigationType(),
          })
        }
      })

      observer.observe({ entryTypes: ["layout-shift"] })
      this.observers.push(observer)

      // Auto-disconnect after 30 seconds
      setTimeout(() => {
        observer.disconnect()
      }, 30000)
    } catch (error) {
      // Silently fail
    }
  }

  private reportMetric(metric: WebVitalMetric): void {
    if (this.isDestroyed) return

    try {
      // Store metric
      this.metrics.set(metric.name, metric)

      // Log if enabled
      if (this.config.enableLogging) {
        console.log(`Web Vital - ${metric.name}:`, {
          value: `${metric.value.toFixed(2)}ms`,
          rating: metric.rating,
          id: metric.id,
        })
      }

      // Send to endpoint if configured (non-blocking)
      if (this.config.endpoint) {
        this.sendMetric(metric).catch(() => {
          // Silently fail
        })
      }

      // Trigger custom event
      if (typeof window !== "undefined") {
        try {
          window.dispatchEvent(new CustomEvent("webvital", { detail: metric }))
        } catch {
          // Silently fail
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  private async sendMetric(metric: WebVitalMetric): Promise<void> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      await fetch(this.config.endpoint!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...metric,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          connection: this.getConnectionInfo(),
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
    } catch (error) {
      // Silently fail
    }
  }

  private setupBeforeUnload(): void {
    if (typeof window === "undefined") return

    const handleUnload = () => {
      this.flushMetrics()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        this.flushMetrics()
      }
    }

    window.addEventListener("beforeunload", handleUnload, { passive: true })
    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true })
  }

  private flushMetrics(): void {
    if (this.isDestroyed) return

    try {
      const metricsToSend = Array.from(this.metrics.values())

      if (metricsToSend.length > 0 && this.config.endpoint && navigator.sendBeacon) {
        // Use sendBeacon for reliable delivery
        navigator.sendBeacon(
          this.config.endpoint,
          JSON.stringify({
            metrics: metricsToSend,
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
        )
      }
    } catch (error) {
      // Silently fail
    }
  }

  // Rating functions based on Web Vitals thresholds
  private getCLSRating(value: number): "good" | "needs-improvement" | "poor" {
    return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor"
  }

  private getFCPRating(value: number): "good" | "needs-improvement" | "poor" {
    return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor"
  }

  private getTTFBRating(value: number): "good" | "needs-improvement" | "poor" {
    return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor"
  }

  private getNavigationType(): string {
    try {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      return navigation ? navigation.type : "unknown"
    } catch {
      return "unknown"
    }
  }

  private getConnectionInfo(): any {
    try {
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      if (connection) {
        return {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }
      }
    } catch {
      // Silently fail
    }

    return null
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Public methods
  getMetrics(): WebVitalMetric[] {
    return Array.from(this.metrics.values())
  }

  getMetric(name: WebVitalMetric["name"]): WebVitalMetric | undefined {
    return this.metrics.get(name)
  }

  destroy(): void {
    this.isDestroyed = true

    // Disconnect all observers
    this.observers.forEach((observer) => {
      try {
        observer.disconnect()
      } catch {
        // Silently fail
      }
    })

    this.observers = []
    this.metrics.clear()
  }
}

// React hook for Web Vitals
import React from "react"

export function useWebVitals(config?: PerformanceConfig) {
  const [metrics, setMetrics] = React.useState<WebVitalMetric[]>([])
  const monitorRef = React.useRef<WebVitalsMonitor | null>(null)

  React.useEffect(() => {
    monitorRef.current = new WebVitalsMonitor(config)

    const handleWebVital = (event: CustomEvent<WebVitalMetric>) => {
      setMetrics((prev) => {
        const newMetrics = [...prev]
        const existingIndex = newMetrics.findIndex((m) => m.name === event.detail.name)

        if (existingIndex >= 0) {
          newMetrics[existingIndex] = event.detail
        } else {
          newMetrics.push(event.detail)
        }

        return newMetrics
      })
    }

    if (typeof window !== "undefined") {
      window.addEventListener("webvital", handleWebVital as EventListener)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("webvital", handleWebVital as EventListener)
      }
      monitorRef.current?.destroy()
    }
  }, [])

  return {
    metrics,
    getMetric: (name: WebVitalMetric["name"]) => metrics.find((m) => m.name === name),
    getAllMetrics: () => monitorRef.current?.getMetrics() || [],
  }
}

// Export singleton instance (disabled by default)
export const webVitalsMonitor = new WebVitalsMonitor({ enableLogging: false, sampleRate: 0.05 })

// Export types
export type { WebVitalMetric, PerformanceConfig }
