"use client"

import { useEffect, useState } from "react"
import { performanceOptimizer } from "@/lib/performance-optimizer"
import { usePerformance } from "@/hooks/use-performance"

interface PerformanceData {
  loadTime: number
  renderTime: number
  bundleSize: { totalJSSize: number; totalCSSSize: number }
  memoryUsage?: number
  connectionType?: string
}

export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [showMonitor, setShowMonitor] = useState(false)
  const metrics = usePerformance()

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const shouldShow =
      process.env.NODE_ENV === "development" || localStorage.getItem("show-performance-monitor") === "true"
    setShowMonitor(shouldShow)

    if (shouldShow) {
      const bundleSize = performanceOptimizer.checkBundleSize()

      setPerformanceData({
        loadTime: metrics?.loadTime || 0,
        renderTime: metrics?.renderTime || 0,
        bundleSize,
        memoryUsage: metrics?.memoryUsage,
        connectionType: metrics?.connectionType,
      })
    }
  }, [metrics])

  if (!showMonitor || !performanceData) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Performance Monitor</h3>
        <button onClick={() => setShowMonitor(false)} className="text-gray-400 hover:text-white">
          ×
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Load Time:</span>
          <span className={performanceData.loadTime > 2000 ? "text-red-400" : "text-green-400"}>
            {performanceData.loadTime.toFixed(0)}ms
          </span>
        </div>

        <div className="flex justify-between">
          <span>Render Time:</span>
          <span className={performanceData.renderTime > 16 ? "text-red-400" : "text-green-400"}>
            {performanceData.renderTime.toFixed(0)}ms
          </span>
        </div>

        <div className="flex justify-between">
          <span>JS Bundle:</span>
          <span className={performanceData.bundleSize.totalJSSize > 250000 ? "text-red-400" : "text-green-400"}>
            {(performanceData.bundleSize.totalJSSize / 1024).toFixed(0)}KB
          </span>
        </div>

        {performanceData.memoryUsage && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span>{(performanceData.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
          </div>
        )}

        {performanceData.connectionType && (
          <div className="flex justify-between">
            <span>Connection:</span>
            <span>{performanceData.connectionType}</span>
          </div>
        )}
      </div>
    </div>
  )
}
