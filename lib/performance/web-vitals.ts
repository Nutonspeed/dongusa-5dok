"use client"

// Web Vitals monitoring implementation
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
  private observer: PerformanceObserver | null = null

  constructor(config: PerformanceConfig = {}) {
    this.config = {
      reportAllChanges: false,
      enableLogging: true,
      sampleRate: 1.0,
      endpoint: "/api/metrics/web-vitals",
      ...config,
    }

    this.initializeMonitoring()
  }

  private initializeMonitoring(): void {
    // Only run in browser
    if (typeof window === "undefined") return

    // Sample rate check
    if (Math.random() > this.config.sampleRate!) return

    this.measureCLS()
    this.measureFID()
    this.measureFCP()
    this.measureLCP()
    this.measureTTFB()
    this.measureINP()

    // Send metrics when page is about to unload
    this.setupBeforeUnload()
  }

  private measureCLS(): void {
    let clsValue = 0
    const clsEntries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          clsEntries.push(entry)
        }
      }

      const lastEntry = clsEntries[clsEntries.length - 1]
      this.reportMetric({
        name: "CLS",
        value: clsValue,
        rating: this.getCLSRating(clsValue),
        delta: lastEntry ? (lastEntry as any).value : 0,
        id: this.generateId(),
        navigationType: this.getNavigationType(),
      })
    })

    observer.observe({ entryTypes: ["layout-shift"] })
  }

  private measureFID(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidValue = entry.processingStart - entry.startTime

        this.reportMetric({
          name: "FID",
          value: fidValue,
          rating: this.getFIDRating(fidValue),
          delta: fidValue,
          id: this.generateId(),
          navigationType: this.getNavigationType(),
        })
      }
    })

    observer.observe({ entryTypes: ["first-input"] })
  }

  private measureFCP(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          const fcpValue = entry.startTime

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

    observer.observe({ entryTypes: ["paint"] })
  }

  private measureLCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      const lcpValue = lastEntry.startTime

      this.reportMetric({
        name: "LCP",
        value: lcpValue,
        rating: this.getLCPRating(lcpValue),
        delta: lcpValue,
        id: this.generateId(),
        navigationType: this.getNavigationType(),
      })
    })

    observer.observe({ entryTypes: ["largest-contentful-paint"] })
  }

  private measureTTFB(): void {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    if (navigation) {
      const ttfbValue = navigation.responseStart - navigation.fetchStart

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

  private measureINP(): void {
    // Interaction to Next Paint (INP) - newer metric
    const observer = new PerformanceObserver((list) => {
      let longestInteraction = 0

      for (const entry of list.getEntries()) {
        const interactionTime = entry.processingStart - entry.startTime
        if (interactionTime > longestInteraction) {
          longestInteraction = interactionTime
        }
      }

      if (longestInteraction > 0) {
        this.reportMetric({
          name: "INP",
          value: longestInteraction,
          rating: this.getINPRating(longestInteraction),
          delta: longestInteraction,
          id: this.generateId(),
          navigationType: this.getNavigationType(),
        })
      }
    })

    observer.observe({ entryTypes: ["event"] })
  }

  private reportMetric(metric: WebVitalMetric): void {
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

    // Send to endpoint if configured
    if (this.config.endpoint) {
      this.sendMetric(metric)
    }

    // Trigger custom event
    window.dispatchEvent(new CustomEvent("webvital", { detail: metric }))
  }

  private async sendMetric(metric: WebVitalMetric): Promise<void> {
    try {
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
      })
    } catch (error) {
      console.error("Failed to send web vital metric:", error)
    }
  }

  private setupBeforeUnload(): void {
    window.addEventListener("beforeunload", () => {
      // Send any remaining metrics
      this.flushMetrics()
    })

    // Also send on visibility change (when user switches tabs)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flushMetrics()
      }
    })
  }

  private flushMetrics(): void {
    const metricsToSend = Array.from(this.metrics.values())

    if (metricsToSend.length > 0 && this.config.endpoint) {
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
  }

  // Rating functions based on Web Vitals thresholds
  private getCLSRating(value: number): "good" | "needs-improvement" | "poor" {
    return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor"
  }

  private getFIDRating(value: number): "good" | "needs-improvement" | "poor" {
    return value <= 100 ? "good" : value <= 300 ? "needs-improvement" : "poor"
  }

  private getFCPRating(value: number): "good" | "needs-improvement" | "poor" {
    return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor"
  }

  private getLCPRating(value: number): "good" | "needs-improvement" | "poor" {
    return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor"
  }

  private getTTFBRating(value: number): "good" | "needs-improvement" | "poor" {
    return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor"
  }

  private getINPRating(value: number): "good" | "needs-improvement" | "poor" {
    return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor"
  }

  private getNavigationType(): string {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    return navigation ? navigation.type : "unknown"
  }

  private getConnectionInfo(): any {
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
    if (this.observer) {
      this.observer.disconnect()
    }
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

    window.addEventListener("webvital", handleWebVital as EventListener)

    return () => {
      window.removeEventListener("webvital", handleWebVital as EventListener)
      monitorRef.current?.destroy()
    }
  }, [])

  return {
    metrics,
    getMetric: (name: WebVitalMetric["name"]) => metrics.find((m) => m.name === name),
    getAllMetrics: () => monitorRef.current?.getMetrics() || [],
  }
}

// Export singleton instance
export const webVitalsMonitor = new WebVitalsMonitor()

// Export types
export type { WebVitalMetric, PerformanceConfig }
