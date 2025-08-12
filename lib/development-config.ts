import { logger } from '@/lib/logger';
// Development Configuration for Mock Services
import { mockDatabaseService } from "./mock-database"
import { mockEmailService } from "./mock-email"
import { mockUploadService } from "./mock-upload"

export const isDevelopment = process.env.NODE_ENV === "development"
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
export const isProduction = process.env.NODE_ENV === "production"

export const developmentConfig = {
  // Demo mode settings
  demo: {
    enabled: isDemoMode,
    autoLogin: true,
    showBanner: true,
    resetDataInterval: 24 * 60 * 60 * 1000, // 24 hours
    showIndicators: true,
  },

  // Service configurations
  services: {
    database: {
      useMock: isDevelopment || isDemoMode,
      autoSeed: true,
      simulateLatency: true,
      latency: {
        min: 100,
        max: 500,
      },
      errorRate: 0.02, // 2% error rate
    },
    email: {
      useMock: isDevelopment || isDemoMode,
      saveHistory: true,
      logToConsole: true,
      successRate: 0.95, // 95% success rate
    },
    upload: {
      useMock: isDevelopment || isDemoMode,
      simulateProgress: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
      successRate: 0.98, // 98% success rate
    },
  },

  // Sample data configuration
  sampleData: {
    products: {
      count: 20,
      categories: ["covers", "accessories"],
      priceRange: [290, 2990],
    },
    customers: {
      count: 50,
      orderRange: [1, 10],
      spentRange: [500, 15000],
    },
    orders: {
      count: 100,
      statusDistribution: {
        pending: 0.2,
        production: 0.3,
        shipped: 0.25,
        completed: 0.2,
        cancelled: 0.05,
      },
    },
  },

  // Development tools
  tools: {
    showDebugInfo: isDevelopment,
    showMockBadges: isDemoMode,
    enableConsoleLogging: true,
    showPerformanceMetrics: false,
  },

  // Admin credentials for demo
  adminCredentials: {
    email: "admin@sofacover.com",
    password: "demo123456",
    name: "ผู้ดูแลระบบ",
    role: "admin",
  },
}

// Development utilities
export const devUtils = {
  // Check if running in development mode
  isDevelopment(): boolean {
    return isDevelopment
  },

  // Check if demo mode is enabled
  isDemoMode(): boolean {
    return isDemoMode
  },

  // Get service status
  getServiceStatus() {
    return {
      database: developmentConfig.services.database.useMock ? "mock" : "real",
      email: developmentConfig.services.email.useMock ? "mock" : "real",
      upload: developmentConfig.services.upload.useMock ? "mock" : "real",
    }
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B"

    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  },

  // Format number with Thai locale
  formatNumber(num: number): string {
    return num.toLocaleString("th-TH")
  },

  // Format currency
  formatCurrency(amount: number): string {
    return `${amount.toLocaleString("th-TH")} บาท`
  },

  // Generate random data
  generateRandomData: {
    // Generate random Thai name
    randomThaiName(): string {
      const firstNames = ["สมชาย", "มาลี", "วิชัย", "สุดา", "ประยุทธ", "นิรันดร", "สมหญิง", "บุญมี", "ชาญ", "วิมล"]
      const lastNames = ["ใจดี", "สวยงาม", "รวยมาก", "มั่งมี", "เจริญ", "สุขใส", "ดีใจ", "มีสุข", "รุ่งเรือง", "เฟื่องฟู"]

      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

      return `คุณ${firstName} ${lastName}`
    },

    // Generate random email
    randomEmail(): string {
      const domains = ["gmail.com", "hotmail.com", "yahoo.com", "email.com", "mail.com"]
      const username = Math.random().toString(36).substring(2, 10)
      const domain = domains[Math.floor(Math.random() * domains.length)]

      return `${username}@${domain}`
    },

    // Generate random phone number
    randomPhone(): string {
      const prefixes = ["081", "082", "083", "084", "085", "086", "087", "088", "089"]
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
      const number = Math.floor(Math.random() * 9000000) + 1000000

      return `${prefix}-${number.toString().substring(0, 3)}-${number.toString().substring(3)}`
    },

    // Generate random address
    randomAddress(): string {
      const streets = ["สุขุมวิท", "พหลโยธิน", "รัชดาภิเษก", "วิภาวดี", "รามคำแหง", "ลาดพร้าว", "งามวงศ์วาน", "บางนา-ตราด"]
      const districts = ["คลองเตย", "ลาดยาว", "ห้วยขวาง", "บางนา", "วัฒนา", "สาทร", "ปทุมวัน", "ราชเทวี"]
      const provinces = ["กรุงเทพฯ", "นนทบุรี", "ปทุมธานี", "สมุทรปราการ"]

      const houseNumber = Math.floor(Math.random() * 999) + 1
      const street = streets[Math.floor(Math.random() * streets.length)]
      const district = districts[Math.floor(Math.random() * districts.length)]
      const province = provinces[Math.floor(Math.random() * provinces.length)]
      const zipCode = Math.floor(Math.random() * 90000) + 10000

      return `${houseNumber} ถ.${street} แขวง${district} เขต${district} ${province} ${zipCode}`
    },

    // Generate random date within range
    randomDate(daysBack = 30): string {
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
      return date.toISOString()
    },
  },

  // Reset demo data
  async resetDemoData() {
    // Reset all mock services
    await mockDatabaseService.clearAllData()
    await mockEmailService.clearEmailHistory()
    await mockUploadService.clearAllFiles()

    // Reseed with fresh data
    await this.generateMockData()

    logger.info("Demo data reset successfully")
  },

  // Generate mock data
  async generateMockData() {
    if (!isDevelopment) return

    // Generate additional mock data for development
    await mockDatabaseService.seedSampleData()

    // Send some test emails
      await mockEmailService.sendEmail({
        to: "test@example.com",
        subject: "Test Email",
        html: "This is a test email",
      })
      await mockEmailService.sendEmail({
        to: "admin@example.com",
        subject: "Admin Notification",
        html: "Admin test email",
      })

    logger.info("Mock data generated successfully")
  },

  // Log system info
  logSystemInfo(): void {
    if (!this.isDevelopment()) return

    logger.group("🔧 [DEV UTILS] System Information")
    logger.info("Environment:", process.env.NODE_ENV)
    logger.info("Demo Mode:", this.isDemoMode())
    logger.info("Services:", this.getServiceStatus())
    logger.info("Config:", developmentConfig)
    logger.groupEnd()
  },

  // Performance monitoring
  performance: {
    timers: new Map<string, number>(),

    start(label: string): void {
      if (!developmentConfig.tools.showPerformanceMetrics) return
      this.timers.set(label, performance.now())
    },

    end(label: string): number {
      if (!developmentConfig.tools.showPerformanceMetrics) return 0

      const startTime = this.timers.get(label)
      if (!startTime) return 0

      const duration = performance.now() - startTime
      logger.info(`⏱️ [PERF] ${label}: ${duration.toFixed(2)}ms`)
      this.timers.delete(label)

      return duration
    },
  },

  // Get system status
  async getSystemStatus() {
    const [products, customers, orders, analytics] = await Promise.all([
      mockDatabaseService.getProducts(),
      mockDatabaseService.getCustomers(),
      mockDatabaseService.getOrders(),
      mockDatabaseService.getAnalytics(),
    ])

    const [emailStats, uploadStats] = await Promise.all([
      mockEmailService.getEmailStatistics(),
      mockUploadService.getUploadStatistics(),
    ])

    return {
      database: {
        products: products.length,
        customers: customers.length,
        orders: orders.length,
        revenue: analytics.totalRevenue,
      },
      email: emailStats,
      upload: uploadStats,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }
  },
}

// Auto-reset data in demo mode
if (typeof window !== "undefined" && developmentConfig.demo.enabled) {
  // Set up auto-reset interval
  setInterval(async () => {
    try {
      await devUtils.resetDemoData()
      logger.info("🔄 [AUTO RESET] ข้อมูลสาธิตถูกรีเซ็ตอัตโนมัติ")
    } catch (error) {
      logger.error("❌ [AUTO RESET] รีเซ็ตอัตโนมัติล้มเหลว:", error)
    }
  }, developmentConfig.demo.resetDataInterval)
}

// Log system info on startup
if (typeof window === "undefined") {
  devUtils.logSystemInfo()
}

// Admin settings
export const adminSettings = {
  demoCredentials: {
    email: "admin@sofacover.com",
    password: "demo123456",
  },
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
}

// Performance monitoring
export const performanceMonitoring = {
  enabled: isDevelopment,
  logQueries: true,
  logUploads: true,
  logEmails: true,
}

// Initialize mock data in development
if (isDevelopment && typeof window === "undefined") {
  devUtils.generateMockData().catch(logger.error)
}
