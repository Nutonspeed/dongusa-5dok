// Enhanced development configuration with error prevention
import { mockDatabaseService } from "./mock-database"
import { mockEmailService } from "./mock-email"

export const isDevelopment = process.env.NODE_ENV === "development"
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
export const isProduction = process.env.NODE_ENV === "production"

// Error tracking configuration
export const errorConfig = {
  enableConsoleLogging: isDevelopment,
  enableErrorBoundaries: true,
  enablePerformanceMonitoring: isDevelopment,
  maxErrorRetries: 3,
  errorCooldownMs: 5000,
}

// Performance monitoring
export const performanceConfig = {
  enableMetrics: isDevelopment,
  slowOperationThreshold: 1000, // ms
  memoryLeakDetection: isDevelopment,
  renderTimeTracking: isDevelopment,
}

// Safe operation wrapper
export class SafeOperationManager {
  private static errorCounts = new Map<string, number>()
  private static lastErrorTime = new Map<string, number>()

  static async execute<T>(
    operationName: string,
    operation: () => Promise<T>,
    fallback: T,
    options?: {
      maxRetries?: number
      cooldownMs?: number
      onError?: (error: Error) => void
    },
  ): Promise<T> {
    const {
      maxRetries = errorConfig.maxErrorRetries,
      cooldownMs = errorConfig.errorCooldownMs,
      onError,
    } = options || {}

    const errorCount = this.errorCounts.get(operationName) || 0
    const lastError = this.lastErrorTime.get(operationName) || 0
    const now = Date.now()

    // Check if we're in cooldown period
    if (errorCount >= maxRetries && now - lastError < cooldownMs) {
      console.warn(`Operation ${operationName} is in cooldown, returning fallback`)
      return fallback
    }

    // Reset error count if cooldown period has passed
    if (now - lastError >= cooldownMs) {
      this.errorCounts.set(operationName, 0)
    }

    try {
      const result = await operation()
      // Reset error count on success
      this.errorCounts.set(operationName, 0)
      return result
    } catch (error) {
      const newErrorCount = errorCount + 1
      this.errorCounts.set(operationName, newErrorCount)
      this.lastErrorTime.set(operationName, now)

      console.error(`Operation ${operationName} failed (attempt ${newErrorCount}):`, error)

      if (onError) {
        try {
          onError(error as Error)
        } catch (callbackError) {
          console.error("Error callback failed:", callbackError)
        }
      }

      return fallback
    }
  }

  static getErrorStats() {
    return {
      errorCounts: Object.fromEntries(this.errorCounts),
      lastErrorTimes: Object.fromEntries(this.lastErrorTime),
    }
  }

  static resetErrorStats() {
    this.errorCounts.clear()
    this.lastErrorTime.clear()
  }
}

// Development utilities with error prevention
export const devUtils = {
  // Safe data generation
  async generateMockData() {
    return SafeOperationManager.execute(
      "generateMockData",
      async () => {
        await mockDatabaseService.seedSampleData()
        await mockEmailService.sendEmail("test@example.com", "Test Email", "Test content")
        return true
      },
      false,
      {
        onError: (error) => console.warn("Mock data generation failed:", error),
      },
    )
  },

  // Safe system status check
  async getSystemStatus() {
    return SafeOperationManager.execute(
      "getSystemStatus",
      async () => {
        const [products, customers, orders] = await Promise.all([
          mockDatabaseService.getProducts(),
          mockDatabaseService.getCustomers(),
          mockDatabaseService.getOrders(),
        ])

        return {
          database: {
            products: products.length,
            customers: customers.length,
            orders: orders.length,
          },
          timestamp: new Date().toISOString(),
          status: "healthy",
        }
      },
      {
        database: { products: 0, customers: 0, orders: 0 },
        timestamp: new Date().toISOString(),
        status: "error",
      },
    )
  },

  // Performance monitoring
  performance: {
    timers: new Map<string, number>(),

    start(label: string) {
      if (!performanceConfig.enableMetrics) return
      this.timers.set(label, performance.now())
    },

    end(label: string): number {
      if (!performanceConfig.enableMetrics) return 0

      const startTime = this.timers.get(label)
      if (!startTime) return 0

      const duration = performance.now() - startTime
      this.timers.delete(label)

      if (duration > performanceConfig.slowOperationThreshold) {
        console.warn(`⚠️ Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
      } else if (performanceConfig.renderTimeTracking) {
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
      }

      return duration
    },
  },

  // Memory leak detection
  memoryMonitor: {
    checkInterval: null as NodeJS.Timeout | null,

    start() {
      if (!performanceConfig.memoryLeakDetection || typeof window === "undefined") return

      this.checkInterval = setInterval(() => {
        if (performance.memory) {
          const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory
          const usagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100

          if (usagePercent > 80) {
            console.warn(`🚨 High memory usage detected: ${usagePercent.toFixed(2)}%`)
          }
        }
      }, 30000) // Check every 30 seconds
    },

    stop() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval)
        this.checkInterval = null
      }
    },
  },
}

// Initialize monitoring in development
if (isDevelopment && typeof window !== "undefined") {
  devUtils.memoryMonitor.start()

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    devUtils.memoryMonitor.stop()
  })
}

// Export safe configuration
export const developmentConfig = {
  demo: {
    enabled: isDemoMode,
    autoLogin: false, // Disabled to prevent auto-login loops
    showBanner: isDemoMode,
    resetDataInterval: 24 * 60 * 60 * 1000, // 24 hours
    showIndicators: isDemoMode,
  },

  services: {
    database: {
      useMock: isDevelopment || isDemoMode,
      autoSeed: true,
      simulateLatency: true,
      latency: { min: 100, max: 500 },
      errorRate: 0.01, // Reduced error rate
    },
    email: {
      useMock: isDevelopment || isDemoMode,
      saveHistory: true,
      logToConsole: isDevelopment,
      successRate: 0.98, // Increased success rate
    },
    upload: {
      useMock: isDevelopment || isDemoMode,
      simulateProgress: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
      successRate: 0.99, // Increased success rate
    },
  },

  tools: {
    showDebugInfo: isDevelopment,
    showMockBadges: isDemoMode,
    enableConsoleLogging: isDevelopment,
    showPerformanceMetrics: isDevelopment,
  },

  adminCredentials: {
    email: "admin@sofacover.com",
    password: "admin123",
    name: "ผู้ดูแลระบบ",
    role: "admin",
  },
}
