"use client"

import React from "react"

// Resource monitoring for images, scripts, stylesheets, etc.
interface ResourceTiming {
  name: string
  type: string
  size: number
  duration: number
  startTime: number
  endTime: number
  transferSize: number
  encodedBodySize: number
  decodedBodySize: number
  initiatorType: string
  nextHopProtocol: string
  renderBlockingStatus?: string
}

interface ResourceMetrics {
  totalResources: number
  totalSize: number
  totalDuration: number
  resourcesByType: Record<string, ResourceTiming[]>
  slowestResources: ResourceTiming[]
  largestResources: ResourceTiming[]
  renderBlockingResources: ResourceTiming[]
}

class ResourceMonitor {
  private observer: PerformanceObserver | null = null
  private resources: ResourceTiming[] = []
  private callbacks: ((metrics: ResourceMetrics) => void)[] = []

  constructor() {
    this.initializeMonitoring()
  }

  private initializeMonitoring(): void {
    if (typeof window === "undefined") return

    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[]

      entries.forEach((entry) => {
        const resource: ResourceTiming = {
          name: entry.name,
          type: this.getResourceType(entry.name, entry.initiatorType),
          size: entry.transferSize || 0,
          duration: entry.duration,
          startTime: entry.startTime,
          endTime: entry.responseEnd,
          transferSize: entry.transferSize || 0,
          encodedBodySize: entry.encodedBodySize || 0,
          decodedBodySize: entry.decodedBodySize || 0,
          initiatorType: entry.initiatorType,
          nextHopProtocol: entry.nextHopProtocol || "",
          renderBlockingStatus: (entry as any).renderBlockingStatus,
        }

        this.resources.push(resource)
        this.notifyCallbacks()
      })
    })

    this.observer.observe({ entryTypes: ["resource"] })

    // Also capture existing resources
    this.captureExistingResources()
  }

  private captureExistingResources(): void {
    const existingResources = performance.getEntriesByType("resource") as PerformanceResourceTiming[]

    existingResources.forEach((entry) => {
      const resource: ResourceTiming = {
        name: entry.name,
        type: this.getResourceType(entry.name, entry.initiatorType),
        size: entry.transferSize || 0,
        duration: entry.duration,
        startTime: entry.startTime,
        endTime: entry.responseEnd,
        transferSize: entry.transferSize || 0,
        encodedBodySize: entry.encodedBodySize || 0,
        decodedBodySize: entry.decodedBodySize || 0,
        initiatorType: entry.initiatorType,
        nextHopProtocol: entry.nextHopProtocol || "",
        renderBlockingStatus: (entry as any).renderBlockingStatus,
      }

      this.resources.push(resource)
    })

    this.notifyCallbacks()
  }

  private getResourceType(url: string, initiatorType: string): string {
    // Determine resource type from URL and initiator
    if (initiatorType === "img" || /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url)) {
      return "image"
    }

    if (initiatorType === "script" || /\.(js|mjs)$/i.test(url)) {
      return "script"
    }

    if (initiatorType === "link" || /\.(css)$/i.test(url)) {
      return "stylesheet"
    }

    if (/\.(woff|woff2|ttf|otf|eot)$/i.test(url)) {
      return "font"
    }

    if (/\.(mp4|webm|ogg|avi|mov)$/i.test(url)) {
      return "video"
    }

    if (/\.(mp3|wav|ogg|aac|flac)$/i.test(url)) {
      return "audio"
    }

    if (initiatorType === "fetch" || initiatorType === "xmlhttprequest") {
      return "xhr"
    }

    return "other"
  }

  private notifyCallbacks(): void {
    const metrics = this.generateMetrics()
    this.callbacks.forEach((callback) => callback(metrics))
  }

  private generateMetrics(): ResourceMetrics {
    const resourcesByType: Record<string, ResourceTiming[]> = {}
    let totalSize = 0
    let totalDuration = 0

    this.resources.forEach((resource) => {
      if (!resourcesByType[resource.type]) {
        resourcesByType[resource.type] = []
      }
      resourcesByType[resource.type].push(resource)
      totalSize += resource.size
      totalDuration += resource.duration
    })

    // Find slowest resources (top 10)
    const slowestResources = [...this.resources].sort((a, b) => b.duration - a.duration).slice(0, 10)

    // Find largest resources (top 10)
    const largestResources = [...this.resources].sort((a, b) => b.size - a.size).slice(0, 10)

    // Find render-blocking resources
    const renderBlockingResources = this.resources.filter((resource) => resource.renderBlockingStatus === "blocking")

    return {
      totalResources: this.resources.length,
      totalSize,
      totalDuration,
      resourcesByType,
      slowestResources,
      largestResources,
      renderBlockingResources,
    }
  }

  // Public methods
  getMetrics(): ResourceMetrics {
    return this.generateMetrics()
  }

  onMetricsUpdate(callback: (metrics: ResourceMetrics) => void): () => void {
    this.callbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  getResourcesByType(type: string): ResourceTiming[] {
    return this.resources.filter((resource) => resource.type === type)
  }

  getSlowResources(threshold = 1000): ResourceTiming[] {
    return this.resources.filter((resource) => resource.duration > threshold)
  }

  getLargeResources(threshold = 100000): ResourceTiming[] {
    return this.resources.filter((resource) => resource.size > threshold)
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
    }
    this.callbacks = []
  }
}

// React hook for resource monitoring
export function useResourceMonitor() {
  const [metrics, setMetrics] = React.useState<ResourceMetrics | null>(null)
  const monitorRef = React.useRef<ResourceMonitor | null>(null)

  React.useEffect(() => {
    monitorRef.current = new ResourceMonitor()

    const unsubscribe = monitorRef.current.onMetricsUpdate(setMetrics)

    return () => {
      unsubscribe()
      monitorRef.current?.destroy()
    }
  }, [])

  return {
    metrics,
    getResourcesByType: (type: string) => monitorRef.current?.getResourcesByType(type) || [],
    getSlowResources: (threshold?: number) => monitorRef.current?.getSlowResources(threshold) || [],
    getLargeResources: (threshold?: number) => monitorRef.current?.getLargeResources(threshold) || [],
  }
}

// Export singleton instance
export const resourceMonitor = new ResourceMonitor()

// Export types
export type { ResourceTiming, ResourceMetrics }
