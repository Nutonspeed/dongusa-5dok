import { logger } from "@/lib/logger"

// Runtime configuration with safety checks
export const NODE_ENV = process.env.NODE_ENV || "development"
export const IS_PRODUCTION = NODE_ENV === "production"
export const IS_DEVELOPMENT = NODE_ENV === "development"
export const MAINTENANCE_MODE = process.env.MAINTENANCE === "1"

// Supabase configuration with validation
export const USE_SUPABASE = (() => {
  const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === "true"

  if (IS_PRODUCTION && !useSupabase) {
    logger.warn("⚠️ WARNING: Using mock database in production!")
  }

  return useSupabase
})()

// QA Bypass with strict production check
export const QA_BYPASS_AUTH = (() => {
  const bypass = process.env.QA_BYPASS_AUTH === "1"

  if (IS_PRODUCTION && bypass && !MAINTENANCE_MODE) {
    logger.error("🚨 CRITICAL: QA_BYPASS_AUTH is enabled in production!")
    throw new Error("Security violation: QA bypass cannot be enabled in production")
  }

  if (bypass) {
    logger.warn("⚠️ QA_BYPASS_AUTH is enabled - authentication bypassed")
  }

  return bypass && (!IS_PRODUCTION || MAINTENANCE_MODE)
})()

// Database configuration
export const DATABASE_CONFIG = {
  useSupabase: USE_SUPABASE,
  useMock: !USE_SUPABASE || IS_DEVELOPMENT,
  connectionTimeout: Number.parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || "10000"),
  retryAttempts: 3,
  maxConnections: Number.parseInt(process.env.DATABASE_MAX_CONNECTIONS || "20"),
}

// Email configuration
export const EMAIL_CONFIG = {
  useMock: IS_DEVELOPMENT || !process.env.SMTP_HOST || process.env.MOCK_EMAIL_ENABLED === "true",
  provider: process.env.SMTP_HOST ? "smtp" : "mock",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  from: {
    name: process.env.SMTP_FROM_NAME || "ร้านผ้าคลุมโซฟาพรีเมียม",
    email: process.env.SMTP_FROM_EMAIL || "noreply@sofacover.com",
  },
}

// Upload configuration
export const UPLOAD_CONFIG = {
  useMock: IS_DEVELOPMENT || !process.env.BLOB_READ_WRITE_TOKEN || process.env.MOCK_UPLOAD_ENABLED === "true",
  maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
  maxFilesPerUpload: Number.parseInt(process.env.MAX_FILES_PER_UPLOAD || "10"),
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp,image/gif").split(","),
  imageQuality: Number.parseInt(process.env.IMAGE_QUALITY || "80") / 100,
  sizes: {
    thumbnail: Number.parseInt(process.env.THUMBNAIL_SIZE || "200"),
    medium: Number.parseInt(process.env.MEDIUM_SIZE || "800"),
    large: Number.parseInt(process.env.LARGE_SIZE || "1200"),
  },
}

// Security configuration
export const SECURITY_CONFIG = {
  enableCSP: IS_PRODUCTION,
  enableRateLimit: true,
  sessionTimeout: Number.parseInt(process.env.SESSION_TIMEOUT || "1800000"), // 30 minutes
  maxLoginAttempts: Number.parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5"),
  lockoutDuration: Number.parseInt(process.env.LOCKOUT_DURATION || "900000"), // 15 minutes
  jwtSecret: process.env.JWT_SECRET || "fallback-jwt-secret-for-development",
  encryptionKey: process.env.ENCRYPTION_KEY || "fallback-encryption-key-32-chars",
  csrfSecret: process.env.CSRF_SECRET || "fallback-csrf-secret-for-development",
}

// Payment configuration
export const PAYMENT_CONFIG = {
  useMock: process.env.MOCK_PAYMENT_ENABLED === "true",
  promptpay: {
    id: process.env.PROMPTPAY_ID || "0123456789",
    merchantName: process.env.PROMPTPAY_MERCHANT_NAME || "ร้านผ้าคลุมโซฟาพรีเมียม",
  },
  bankTransfer: {
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "123-4-56789-0",
    bankName: process.env.BANK_NAME || "ธนาคารกรุงเทพ",
    branch: process.env.BANK_BRANCH || "สาขาสยาม",
    accountHolder: process.env.ACCOUNT_HOLDER_NAME || "บริษัท โซฟาคัฟเวอร์ จำกัด",
  },
}

// Shipping configuration
export const SHIPPING_CONFIG = {
  freeShippingThreshold: Number.parseInt(process.env.FREE_SHIPPING_THRESHOLD || "2000"),
  rates: {
    standard: Number.parseInt(process.env.STANDARD_SHIPPING_RATE || "100"),
    express: Number.parseInt(process.env.EXPRESS_SHIPPING_RATE || "200"),
  },
  providers: {
    thailandPost: {
      apiKey: process.env.THAILAND_POST_API_KEY || "",
      customerCode: process.env.THAILAND_POST_CUSTOMER_CODE || "",
    },
    kerry: {
      apiKey: process.env.KERRY_API_KEY || "",
      apiSecret: process.env.KERRY_API_SECRET || "",
    },
    flash: {
      apiKey: process.env.FLASH_API_KEY || "",
      merchantId: process.env.FLASH_MERCHANT_ID || "",
    },
  },
}

// Business configuration
export const BUSINESS_CONFIG = {
  store: {
    name: process.env.STORE_NAME || "ร้านผ้าคลุมโซฟาพรีเมียม",
    nameEn: process.env.STORE_NAME_EN || "Premium Sofa Cover Store",
    phone: process.env.STORE_PHONE || "02-123-4567",
    lineId: process.env.STORE_LINE_ID || "@sofacover",
    address: process.env.STORE_ADDRESS || "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110",
  },
  hours: {
    start: process.env.BUSINESS_HOURS_START || "09:00",
    end: process.env.BUSINESS_HOURS_END || "18:00",
    days: (process.env.BUSINESS_DAYS || "1,2,3,4,5,6").split(",").map(Number),
  },
  inventory: {
    lowStockThreshold: Number.parseInt(process.env.LOW_STOCK_THRESHOLD || "10"),
    autoReorderEnabled: process.env.AUTO_REORDER_ENABLED === "true",
    alertEmail: process.env.STOCK_ALERT_EMAIL || process.env.ADMIN_EMAIL || "inventory@sofacover.com",
  },
}

// Feature flags
export const FEATURE_FLAGS = {
  customCovers: process.env.ENABLE_CUSTOM_COVERS !== "false", // Default true
  bulkOrders: process.env.ENABLE_BULK_ORDERS !== "false", // Default true
  loyaltyProgram: process.env.ENABLE_LOYALTY_PROGRAM === "true",
  reviews: process.env.ENABLE_REVIEWS !== "false", // Default true
  wishlist: process.env.ENABLE_WISHLIST !== "false", // Default true
  advancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS !== "false", // Default true
  bulkOperations: process.env.ENABLE_BULK_OPERATIONS !== "false", // Default true
  exportFeatures: process.env.ENABLE_EXPORT_FEATURES !== "false", // Default true
}

// Localization configuration
export const I18N_CONFIG = {
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "th",
  supportedLocales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || "th,en").split(","),
  currency: {
    code: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "THB",
    symbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "฿",
  },
}

// Development configuration
export const DEV_CONFIG = {
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
  mockServices: process.env.ENABLE_MOCK_SERVICES === "true",
  qaBypass: QA_BYPASS_AUTH,
  skipEmailVerification: process.env.SKIP_EMAIL_VERIFICATION === "true",
  enableTestRoutes: process.env.ENABLE_TEST_ROUTES === "true",
}

// Analytics configuration
export const ANALYTICS_CONFIG = {
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
    enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN || "",
    org: process.env.SENTRY_ORG || "",
    project: process.env.SENTRY_PROJECT || "",
    enabled: !!process.env.SENTRY_DSN,
  },
  performance: {
    enabled: process.env.ENABLE_PERFORMANCE_MONITORING === "true",
    logLevel: process.env.LOG_LEVEL || "info",
  },
}

// Notification configuration
export const NOTIFICATION_CONFIG = {
  line: {
    notifyToken: process.env.LINE_NOTIFY_TOKEN || "",
    enabled: !!process.env.LINE_NOTIFY_TOKEN,
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    privateKey: process.env.FIREBASE_PRIVATE_KEY || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    enabled: !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY),
  },
}

// Log configuration on startup (server-side only)
if (typeof window === "undefined") {
  logger.group("🔧 Runtime Configuration")
  logger.info("Environment:", NODE_ENV)
  logger.info("Use Supabase:", USE_SUPABASE)
  logger.info("QA Bypass:", QA_BYPASS_AUTH)
  logger.info("Database:", DATABASE_CONFIG.useMock ? "Mock" : "Supabase")
  logger.info("Email:", EMAIL_CONFIG.useMock ? "Mock" : "SMTP")
  logger.info("Upload:", UPLOAD_CONFIG.useMock ? "Mock" : "Vercel Blob")
  logger.info("Demo Mode:", DEV_CONFIG.demoMode)
  logger.groupEnd()
}

export default {
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  MAINTENANCE_MODE,
  USE_SUPABASE,
  QA_BYPASS_AUTH,
  DATABASE_CONFIG,
  EMAIL_CONFIG,
  UPLOAD_CONFIG,
  SECURITY_CONFIG,
  PAYMENT_CONFIG,
  SHIPPING_CONFIG,
  BUSINESS_CONFIG,
  FEATURE_FLAGS,
  I18N_CONFIG,
  DEV_CONFIG,
  ANALYTICS_CONFIG,
  NOTIFICATION_CONFIG,
}
