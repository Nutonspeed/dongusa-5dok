"use client"

// Comprehensive performance optimization utilities

import { lazy, Suspense, type ComponentType } from "react"
import dynamic from "next/dynamic"

// Code splitting utilities
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
) => {
  const LazyComponent = lazy(importFn)

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Dynamic imports with loading states
export const createDynamicComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType
    ssr?: boolean
  },
) => {
  return dynamic(importFn, {
    loading: options?.loading || (() => <div>Loading...</div>),
    ssr: options?.ssr ?? true,
  })
}

// Image optimization utilities
export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  sizes?: string
  quality?: number
}

export const createOptimizedImage = (props: OptimizedImageProps) => {
  const {
    src,
    alt,
    width = 800,
    height = 600,
    priority = false,
    placeholder = "empty",
    quality = 75,
    sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    ...rest
  } = props

  // Generate blur placeholder for better UX
  const blurDataURL = `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>
  `)}`

  return {
    src,
    alt,
    width,
    height,
    priority,
    placeholder,
    blurDataURL,
    sizes,
    quality,
    ...rest,
  }
}

// Memoization utilities
export const createMemoizedSelector = <T, R>(selector: (data: T) => R, equalityFn?: (a: R, b: R) => boolean) => {
  let lastInput: T
  let lastOutput: R
  let hasRun = false

  return (input: T): R => {
    if (!hasRun || input !== lastInput) {
      const newOutput = selector(input)

      if (!hasRun || !equalityFn || !equalityFn(lastOutput, newOutput)) {
        lastOutput = newOutput
      }

      lastInput = input
      hasRun = true
    }

    return lastOutput
  }
}

// Virtual scrolling for large lists
export interface VirtualScrollProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: any, index: number) => React.ReactNode
  overscan?: number
}

export const useVirtualScroll = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: Omit<VirtualScrollProps, "renderItem">) => {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight), items.length - 1)

  const startIndex = Math.max(0, visibleStart - overscan)
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan)

  const visibleItems = items.slice(startIndex, endIndex + 1)

  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    setScrollTop,
  }
}

// Debounced search hook
export const useDebouncedSearch = <T>(\
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
) => {\
  const [query, setQuery] = useState("")\
  const [results, setResults] = useState<T[]>([])
  const [loading, setLoading] = useState(false)\
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, delay)

  useEffect(() => {\
    if (!debouncedQuery.trim()) {
      setResults([])\
      return
    }

    const performSearch = async () => {
      setLoading(true)\
      setError(null)

      try {\
        const searchResults = await searchFn(debouncedQuery)
        setResults(searchResults)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed")\
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery, searchFn])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  }
}

// Custom debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {\
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {\
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  options?: IntersectionObserverInit
) => {\
  const [isIntersecting, setIsIntersecting] = useState(false)\
  const [ref, setRef] = useState<Element | null>(null)

  useEffect(() => {\
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      options
    )

    observer.observe(ref)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])
\
  return { ref: setRef, isIntersecting }
}

// Bundle size optimization utilities
export const analyzeBundleSize = () => {\
  if (typeof window === "undefined") return

  const getResourceSizes = () => {\
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
    
    return resources.map(resource => ({\
      name: resource.name,
      size: resource.transferSize || 0,
      type: resource.initiatorType,
      duration: resource.duration,
    }))
  }

  const getTotalBundleSize = () => {\
    const resources = getResourceSizes()
    return resources
      .filter(r => r.type === "script" || r.type === "link")
      .reduce((total, resource) => total + resource.size, 0)
  }

  return {
    getResourceSizes,
    getTotalBundleSize,
  }
}

// Memory leak prevention
export const useMemoryLeakPrevention = () => {\
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const abortControllersRef = useRef<Set<AbortController>>(new Set())

  const setTimeout = (callback: () => void, delay: number) => {\
    const timeout = globalThis.setTimeout(callback, delay)
    timeoutsRef.current.add(timeout)
    return timeout
  }

  const setInterval = (callback: () => void, delay: number) => {\
    const interval = globalThis.setInterval(callback, delay)
    intervalsRef.current.add(interval)
    return interval
  }

  const createAbortController = () => {\
    const controller = new AbortController()
    abortControllersRef.current.add(controller)
    return controller
  }

  useEffect(() => {\
    return () => {
      // Cleanup timeouts
      timeoutsRef.current.forEach(timeout => {
        globalThis.clearTimeout(timeout)
      })\
      timeoutsRef.current.clear()

      // Cleanup intervals
      intervalsRef.current.forEach(interval => {
        globalThis.clearInterval(interval)
      })
      intervalsRef.current.clear()

      // Abort ongoing requests
      abortControllersRef.current.forEach(controller => {
        controller.abort()
      })
      abortControllersRef.current.clear()
    }
  }, [])

  return {
    setTimeout,
    setInterval,
    createAbortController,
  }
}

// Performance budget monitoring
export class PerformanceBudget {\
  private budgets: Map<string, number> = new Map()\
  private violations: Array<{ metric: string; value: number; budget: number; timestamp: number }> = []

  setBudget(metric: string, budget: number): void {
    this.budgets.set(metric, budget)
  }

  checkBudget(metric: string, value: number): boolean {\
    const budget = this.budgets.get(metric)
    if (!budget) return true

    if (value > budget) {
      this.violations.push({
        metric,
        value,
        budget,
        timestamp: Date.now(),
      })
\
      console.warn(`Performance budget violation: ${metric} (${value}) exceeded budget (${budget})`)
      
      // Send to monitoring service in production
      if (process.env.NODE_ENV === "production") {
        this.reportViolation(metric, value, budget)
      }

      return false
    }

    return true
  }

  private reportViolation(metric: string, value: number, budget: number): void {
    fetch("/api/performance-violations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metric,
        value,
        budget,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(() => {
      // Silently fail if reporting fails
    })
  }

  getViolations(): typeof this.violations {\
    return [...this.violations]
  }

  clearViolations(): void {
    this.violations = []
  }
}

export const performanceBudget = new PerformanceBudget()

// Set default budgets
performanceBudget.setBudget("lcp", 2500) // Largest Contentful Paint
performanceBudget.setBudget("fid", 100)  // First Input Delay
performanceBudget.setBudget("cls", 0.1)  // Cumulative Layout Shift
performanceBudget.setBudget("api-response", 1000) // API response time
performanceBudget.setBudget("bundle-size", 500000) // 500KB bundle size
