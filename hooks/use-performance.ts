"use client"

import { useEffect, useState } from "react"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
  connectionType?: string
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    // Measure page load performance
    const measurePerformance = () => {
      if (typeof window !== "undefined" && "performance" in window) {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType("paint")

        const loadTime = navigation.loadEventEnd - navigation.loadEventStart
        const renderTime = paint.find((entry) => entry.name === "first-contentful-paint")?.startTime || 0

        // Get memory usage if available
        const memoryUsage = (performance as any).memory?.usedJSHeapSize

        // Get connection info if available
        const connection = (navigator as any).connection
        const connectionType = connection?.effectiveType

        setMetrics({
          loadTime,
          renderTime,
          memoryUsage,
          connectionType,
        })
      }
    }

    // Measure after page load
    if (document.readyState === "complete") {
      measurePerformance()
    } else {
      window.addEventListener("load", measurePerformance)
      return () => window.removeEventListener("load", measurePerformance)
    }
  }, [])

  return metrics
}

// Hook for monitoring component render performance
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Log slow renders (> 16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === "production") {
        // Analytics.track("component_render_time", {
        //   component: componentName,
        //   renderTime,
        // })
      }
    }
  })
}

// Hook for debouncing expensive operations
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
