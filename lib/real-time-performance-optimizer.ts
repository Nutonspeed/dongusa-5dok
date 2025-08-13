import { performanceOptimizer } from "./performance-optimizer"
import { analytics } from "./analytics-service"

interface RealTimeMetrics {
  pageLoadTime: number
  renderTime: number
  errorRate: number
  userSatisfaction: number
  conversionRate: number
  bounceRate: number
  timestamp: string
}

interface OptimizationAction {
  type: "cache_adjustment" | "bundle_optimization" | "image_optimization" | "database_optimization"
  priority: "low" | "medium" | "high" | "critical"
  description: string
  implementation: () => Promise<void>
  expectedImprovement: number
}

class RealTimePerformanceOptimizer {
  private metrics: RealTimeMetrics[] = []
  private optimizationQueue: OptimizationAction[] = []
  private isOptimizing = false

  constructor() {
    this.startRealTimeMonitoring()
    this.initializeAutoOptimization()
  }

  private startRealTimeMonitoring() {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectCurrentMetrics()
    }, 30000)

    // Analyze and optimize every 5 minutes
    setInterval(() => {
      this.analyzeAndOptimize()
    }, 300000)
  }

  private async collectCurrentMetrics() {
    try {
      const metrics: RealTimeMetrics = {
        pageLoadTime: await this.getAveragePageLoadTime(),
        renderTime: await this.getAverageRenderTime(),
        errorRate: await this.getCurrentErrorRate(),
        userSatisfaction: await this.getUserSatisfactionScore(),
        conversionRate: await this.getConversionRate(),
        bounceRate: await this.getBounceRate(),
        timestamp: new Date().toISOString(),
      }

      this.metrics.push(metrics)

      // Keep only last 100 metrics (about 50 minutes of data)
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100)
      }

      // Check for immediate optimization needs
      await this.checkForImmediateOptimizations(metrics)
    } catch (error) {
      console.error("Error collecting real-time metrics:", error)
    }
  }

  private async getAveragePageLoadTime(): Promise<number> {
    if (typeof window === "undefined") return 0

    const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[]
    if (entries.length === 0) return 0

    const loadTime = entries[0].loadEventEnd - entries[0].navigationStart
    return loadTime
  }

  private async getAverageRenderTime(): Promise<number> {
    if (typeof window === "undefined") return 0

    const paintEntries = performance.getEntriesByType("paint")
    const fcp = paintEntries.find((entry) => entry.name === "first-contentful-paint")
    return fcp ? fcp.startTime : 0
  }

  private async getCurrentErrorRate(): Promise<number> {
    const response = await fetch("/api/monitoring/error-rate?period=30m")
    const data = await response.json()
    return data.errorRate || 0
  }

  private async getUserSatisfactionScore(): Promise<number> {
    const response = await fetch("/api/feedback/satisfaction-score?period=30m")
    const data = await response.json()
    return data.satisfactionScore || 0
  }

  private async getConversionRate(): Promise<number> {
    const response = await fetch("/api/analytics/conversion-rate?period=30m")
    const data = await response.json()
    return data.conversionRate || 0
  }

  private async getBounceRate(): Promise<number> {
    const response = await fetch("/api/analytics/bounce-rate?period=30m")
    const data = await response.json()
    return data.bounceRate || 0
  }

  private async checkForImmediateOptimizations(metrics: RealTimeMetrics) {
    // Critical performance issues that need immediate attention
    if (metrics.pageLoadTime > 3000) {
      this.addOptimizationAction({
        type: "cache_adjustment",
        priority: "critical",
        description: "Page load time exceeds 3 seconds - implementing aggressive caching",
        implementation: async () => {
          await this.implementAggressiveCaching()
        },
        expectedImprovement: 40,
      })
    }

    if (metrics.errorRate > 5) {
      this.addOptimizationAction({
        type: "database_optimization",
        priority: "critical",
        description: "High error rate detected - optimizing database queries",
        implementation: async () => {
          await this.optimizeDatabaseQueries()
        },
        expectedImprovement: 60,
      })
    }

    if (metrics.bounceRate > 70) {
      this.addOptimizationAction({
        type: "image_optimization",
        priority: "high",
        description: "High bounce rate - optimizing image loading",
        implementation: async () => {
          await this.optimizeImageLoading()
        },
        expectedImprovement: 25,
      })
    }

    if (metrics.conversionRate < 2) {
      this.addOptimizationAction({
        type: "bundle_optimization",
        priority: "high",
        description: "Low conversion rate - optimizing checkout performance",
        implementation: async () => {
          await this.optimizeCheckoutPerformance()
        },
        expectedImprovement: 30,
      })
    }
  }

  private addOptimizationAction(action: OptimizationAction) {
    // Avoid duplicate optimizations
    const exists = this.optimizationQueue.some(
      (existing) => existing.type === action.type && existing.description === action.description,
    )

    if (!exists) {
      this.optimizationQueue.push(action)
      this.sortOptimizationQueue()
    }
  }

  private sortOptimizationQueue() {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    this.optimizationQueue.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
  }

  private async analyzeAndOptimize() {
    if (this.isOptimizing || this.optimizationQueue.length === 0) return

    this.isOptimizing = true

    try {
      // Process up to 3 optimizations at once
      const actionsToProcess = this.optimizationQueue.splice(0, 3)

      for (const action of actionsToProcess) {
        console.log(`Implementing optimization: ${action.description}`)
        await action.implementation()

        // Track optimization in analytics
        analytics.trackEvent("performance_optimization", "auto_optimization", action.type, action.expectedImprovement)
      }

      // Send notification about optimizations
      await this.notifyOptimizations(actionsToProcess)
    } catch (error) {
      console.error("Error during auto-optimization:", error)
    } finally {
      this.isOptimizing = false
    }
  }

  private async implementAggressiveCaching() {
    const criticalResources = ["/api/products", "/api/collections", "/api/featured"]

    for (const resource of criticalResources) {
      await performanceOptimizer.getCachedData(
        `aggressive_${resource}`,
        async () => {
          const response = await fetch(resource)
          return response.json()
        },
        600000, // 10 minutes cache
      )
    }

    // Preload critical images
    if (typeof window !== "undefined") {
      const criticalImages = ["/images/hero-sofa.webp", "/images/featured-1.webp", "/images/featured-2.webp"]

      criticalImages.forEach((src) => {
        const link = document.createElement("link")
        link.rel = "preload"
        link.href = src
        link.as = "image"
        document.head.appendChild(link)
      })
    }
  }

  private async optimizeDatabaseQueries() {
    // Implement connection pooling and query optimization
    await fetch("/api/admin/optimize-database", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "optimize_queries",
        enableConnectionPooling: true,
        enableQueryCache: true,
      }),
    })
  }

  private async optimizeImageLoading() {
    if (typeof window !== "undefined") {
      // Implement progressive image loading
      const images = document.querySelectorAll("img[data-src]")
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              img.src = img.dataset.src || ""
              img.classList.remove("lazy")
              imageObserver.unobserve(img)
            }
          })
        },
        { rootMargin: "100px" },
      )

      images.forEach((img) => imageObserver.observe(img))
    }
  }

  private async optimizeCheckoutPerformance() {
    // Preload checkout dependencies
    if (typeof window !== "undefined") {
      const checkoutResources = ["/api/shipping-methods", "/api/payment-methods", "/api/user/profile"]

      checkoutResources.forEach((resource) => {
        fetch(resource, { method: "HEAD" }) // Prefetch resources
      })

      // Optimize form validation
      const forms = document.querySelectorAll("form")
      forms.forEach((form) => {
        form.addEventListener("input", this.debounceValidation, { passive: true })
      })
    }
  }

  private debounceValidation = this.debounce((event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.checkValidity()) {
      input.classList.remove("error")
      input.classList.add("valid")
    }
  }, 300)

  private debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  private async notifyOptimizations(actions: OptimizationAction[]) {
    const notification = {
      type: "performance_optimization",
      actions: actions.map((action) => ({
        type: action.type,
        priority: action.priority,
        description: action.description,
        expectedImprovement: action.expectedImprovement,
      })),
      timestamp: new Date().toISOString(),
    }

    await fetch("/api/notifications/performance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification),
    })
  }

  private initializeAutoOptimization() {
    if (typeof window !== "undefined") {
      // Monitor user interactions
      document.addEventListener("click", (event) => {
        const target = event.target as HTMLElement
        if (target.tagName === "A" || target.closest("a")) {
          // Prefetch likely next page
          const href = (target as HTMLAnchorElement).href || target.closest("a")?.href
          if (href && href.startsWith(window.location.origin)) {
            this.prefetchPage(href)
          }
        }
      })

      // Monitor scroll behavior for lazy loading optimization
      let scrollTimeout: NodeJS.Timeout
      window.addEventListener("scroll", () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          this.optimizeViewportContent()
        }, 150)
      })
    }
  }

  private async prefetchPage(href: string) {
    try {
      const link = document.createElement("link")
      link.rel = "prefetch"
      link.href = href
      document.head.appendChild(link)
    } catch (error) {
      console.error("Error prefetching page:", error)
    }
  }

  private optimizeViewportContent() {
    const viewportHeight = window.innerHeight
    const scrollTop = window.scrollY

    // Lazy load images that are about to enter viewport
    const images = document.querySelectorAll("img[data-src]")
    images.forEach((img) => {
      const rect = img.getBoundingClientRect()
      if (rect.top < viewportHeight + 200) {
        // 200px buffer
        const imgElement = img as HTMLImageElement
        imgElement.src = imgElement.dataset.src || ""
        imgElement.removeAttribute("data-src")
      }
    })
  }

  public getMetrics(): RealTimeMetrics[] {
    return this.metrics
  }

  public getOptimizationQueue(): OptimizationAction[] {
    return this.optimizationQueue
  }

  public async generatePerformanceReport() {
    const recentMetrics = this.metrics.slice(-20) // Last 20 metrics (10 minutes)
    if (recentMetrics.length === 0) return null

    const avgLoadTime = recentMetrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / recentMetrics.length
    const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length
    const avgConversionRate = recentMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / recentMetrics.length

    return {
      period: "Last 10 minutes",
      averageLoadTime: Math.round(avgLoadTime),
      averageErrorRate: Number(avgErrorRate.toFixed(2)),
      averageConversionRate: Number(avgConversionRate.toFixed(2)),
      optimizationsApplied: this.optimizationQueue.length,
      recommendations: this.generateRecommendations(recentMetrics),
    }
  }

  private generateRecommendations(metrics: RealTimeMetrics[]): string[] {
    const recommendations = []
    const avgLoadTime = metrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / metrics.length

    if (avgLoadTime > 2000) {
      recommendations.push("Consider implementing CDN for static assets")
    }

    if (metrics.some((m) => m.errorRate > 3)) {
      recommendations.push("Review error logs and implement better error handling")
    }

    if (metrics.some((m) => m.bounceRate > 60)) {
      recommendations.push("Optimize above-the-fold content loading")
    }

    return recommendations
  }
}

export const realTimeOptimizer = new RealTimePerformanceOptimizer()
export default realTimeOptimizer
