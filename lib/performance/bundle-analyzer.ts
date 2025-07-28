"use client"

import React from "react"

// Bundle size analysis and optimization recommendations
interface BundleChunk {
  name: string
  size: number
  gzipSize?: number
  modules: string[]
  isEntry: boolean
  isAsync: boolean
}

interface BundleAnalysis {
  totalSize: number
  totalGzipSize: number
  chunks: BundleChunk[]
  duplicateModules: string[]
  largeModules: Array<{ name: string; size: number }>
  recommendations: string[]
}

class BundleAnalyzer {
  private analysis: BundleAnalysis | null = null

  async analyzeBundles(): Promise<BundleAnalysis> {
    // In a real implementation, this would analyze webpack stats
    // For now, we'll simulate bundle analysis

    const mockAnalysis: BundleAnalysis = {
      totalSize: 2500000, // 2.5MB
      totalGzipSize: 800000, // 800KB
      chunks: [
        {
          name: "main",
          size: 1200000,
          gzipSize: 400000,
          modules: ["react", "react-dom", "next", "app-code"],
          isEntry: true,
          isAsync: false,
        },
        {
          name: "vendor",
          size: 800000,
          gzipSize: 250000,
          modules: ["lodash", "moment", "chart.js"],
          isEntry: false,
          isAsync: false,
        },
        {
          name: "admin",
          size: 500000,
          gzipSize: 150000,
          modules: ["admin-components", "data-tables"],
          isEntry: false,
          isAsync: true,
        },
      ],
      duplicateModules: ["lodash/isEqual", "moment/locale"],
      largeModules: [
        { name: "moment", size: 300000 },
        { name: "lodash", size: 250000 },
        { name: "chart.js", size: 200000 },
      ],
      recommendations: [],
    }

    // Generate recommendations
    mockAnalysis.recommendations = this.generateRecommendations(mockAnalysis)

    this.analysis = mockAnalysis
    return mockAnalysis
  }

  private generateRecommendations(analysis: BundleAnalysis): string[] {
    const recommendations: string[] = []

    // Check total bundle size
    if (analysis.totalSize > 2000000) {
      // 2MB
      recommendations.push("Bundle size is large (>2MB). Consider code splitting and lazy loading.")
    }

    // Check for large modules
    analysis.largeModules.forEach((module) => {
      if (module.size > 200000) {
        // 200KB
        recommendations.push(
          `${module.name} is large (${(module.size / 1000).toFixed(0)}KB). Consider alternatives or tree shaking.`,
        )
      }
    })

    // Check for duplicate modules
    if (analysis.duplicateModules.length > 0) {
      recommendations.push(
        `Found ${analysis.duplicateModules.length} duplicate modules. Use webpack's SplitChunksPlugin to deduplicate.`,
      )
    }

    // Check compression ratio
    const compressionRatio = analysis.totalGzipSize / analysis.totalSize
    if (compressionRatio > 0.4) {
      recommendations.push("Poor compression ratio. Consider using more compressible code patterns.")
    }

    // Check for non-async chunks
    const syncChunks = analysis.chunks.filter((chunk) => !chunk.isAsync && !chunk.isEntry)
    if (syncChunks.length > 0) {
      recommendations.push("Consider making non-critical chunks async to improve initial load time.")
    }

    return recommendations
  }

  getAnalysis(): BundleAnalysis | null {
    return this.analysis
  }

  // Specific optimization checks
  checkTreeShaking(): string[] {
    const issues: string[] = []

    // Mock tree shaking analysis
    const untreeshakableModules = ["lodash", "moment"]

    untreeshakableModules.forEach((module) => {
      issues.push(`${module} may not be tree-shakable. Consider using individual imports or alternatives.`)
    })

    return issues
  }

  checkCodeSplitting(): string[] {
    const issues: string[] = []

    if (!this.analysis) return issues

    // Check if routes are properly split
    const hasRouteBasedSplitting = this.analysis.chunks.some((chunk) => chunk.isAsync && chunk.name.includes("page"))

    if (!hasRouteBasedSplitting) {
      issues.push("No route-based code splitting detected. Consider using dynamic imports for pages.")
    }

    // Check for large synchronous chunks
    const largeSyncChunks = this.analysis.chunks.filter((chunk) => !chunk.isAsync && chunk.size > 500000)

    if (largeSyncChunks.length > 0) {
      issues.push("Large synchronous chunks detected. Consider splitting into smaller async chunks.")
    }

    return issues
  }

  checkDuplicates(): Array<{ module: string; chunks: string[] }> {
    if (!this.analysis) return []

    // Mock duplicate detection
    return [
      { module: "lodash/isEqual", chunks: ["main", "vendor"] },
      { module: "moment/locale", chunks: ["vendor", "admin"] },
    ]
  }
}

// React hook for bundle analysis
export function useBundleAnalysis() {
  const [analysis, setAnalysis] = React.useState<BundleAnalysis | null>(null)
  const [loading, setLoading] = React.useState(false)
  const analyzerRef = React.useRef<BundleAnalyzer | null>(null)

  React.useEffect(() => {
    analyzerRef.current = new BundleAnalyzer()
  }, [])

  const runAnalysis = React.useCallback(async () => {
    if (!analyzerRef.current) return

    setLoading(true)
    try {
      const result = await analyzerRef.current.analyzeBundles()
      setAnalysis(result)
    } catch (error) {
      console.error("Bundle analysis failed:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    analysis,
    loading,
    runAnalysis,
    checkTreeShaking: () => analyzerRef.current?.checkTreeShaking() || [],
    checkCodeSplitting: () => analyzerRef.current?.checkCodeSplitting() || [],
    checkDuplicates: () => analyzerRef.current?.checkDuplicates() || [],
  }
}

// Export singleton instance
export const bundleAnalyzer = new BundleAnalyzer()

// Export types
export type { BundleChunk, BundleAnalysis }
