import { logger } from "@/lib/logger"
import { USE_SUPABASE } from "@/lib/runtime"

// Application Configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "ร้านผ้าคลุมโซฟาพรีเมียม",
  nameEn: process.env.STORE_NAME_EN || "Premium Sofa Cover Store",
  version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description: "ผ้าคลุมโซฟาคุณภาพพรีเมียม ตัดเย็บตามขนาด",
  keywords: ["ผ้าคลุมโซฟา", "sofa cover", "custom sofa cover", "ผ้าคลุมเฟอร์นิเจอร์"],
}

// Database Configuration
export const DATABASE_CONFIG = {
  useSupabase: USE_SUPABASE,
  maxConnections: Number.parseInt(process.env.DATABASE_MAX_CONNECTIONS || "20"),
  connectionTimeout: Number.parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || "10000"),
  retryAttempts: 3,
  retryDelay: 2000,
}

// Authentication Configuration
export const AUTH_CONFIG = {
  sessionTimeout: Number.parseInt(process.env.SESSION_TIMEOUT || "1800000"), // 30 minutes
  maxLoginAttempts: Number.parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5"),
  lockoutDuration: Number.parseInt(process.env.LOCKOUT_DURATION || "900000"), // 15 minutes
  jwtSecret: process.env.JWT_SECRET || "fallback-jwt-secret-for-development",
  encryptionKey: process.env.ENCRYPTION_KEY || "fallback-encryption-key-32-chars",
}

// Email Configuration
export const EMAIL_CONFIG = {
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  from: {
    name: process.env.SMTP_FROM_NAME || APP_CONFIG.name,
    email: process.env.SMTP_FROM_EMAIL || "noreply@sofacover.com",
  },
  admin: process.env.ADMIN_EMAIL || "admin@sofacover.com",
  support: process.env.SUPPORT_EMAIL || "support@sofacover.com",
  useMock: !process.env.SMTP_HOST || process.env.MOCK_EMAIL_ENABLED === "true",
}

// Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
  maxFilesPerUpload: Number.parseInt(process.env.MAX_FILES_PER_UPLOAD || "10"),
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp,image/gif").split(","),
  imageQuality: Number.parseInt(process.env.IMAGE_QUALITY || "80") / 100,
  sizes: {
    thumbnail: Number.parseInt(process.env.THUMBNAIL_SIZE || "200"),
    medium: Number.parseInt(process.env.MEDIUM_SIZE || "800"),
    large: Number.parseInt(process.env.LARGE_SIZE || "1200"),
  },
  useMock: !process.env.BLOB_READ_WRITE_TOKEN || process.env.MOCK_UPLOAD_ENABLED === "true",
}

// Payment Configuration
export const PAYMENT_CONFIG = {
  promptpay: {
    id: process.env.PROMPTPAY_ID || "0123456789",
    merchantName: process.env.PROMPTPAY_MERCHANT_NAME || APP_CONFIG.name,
  },
  bankTransfer: {
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "123-4-56789-0",
    bankName: process.env.BANK_NAME || "ธนาคารกรุงเทพ",
    branch: process.env.BANK_BRANCH || "สาขาสยาม",
    accountHolder: process.env.ACCOUNT_HOLDER_NAME || "บริษัท โซฟาคัฟเวอร์ จำกัด",
  },
  useMock: process.env.MOCK_PAYMENT_ENABLED === "true",
}

// Shipping Configuration
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

// Business Configuration
export const BUSINESS_CONFIG = {
  store: {
    name: process.env.STORE_NAME || APP_CONFIG.name,
    nameEn: process.env.STORE_NAME_EN || APP_CONFIG.nameEn,
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
    alertEmail: process.env.STOCK_ALERT_EMAIL || EMAIL_CONFIG.admin,
  },
}

// Feature Flags
export const FEATURE_FLAGS = {
  customCovers: process.env.ENABLE_CUSTOM_COVERS === "true",
  bulkOrders: process.env.ENABLE_BULK_ORDERS === "true",
  loyaltyProgram: process.env.ENABLE_LOYALTY_PROGRAM === "true",
  reviews: process.env.ENABLE_REVIEWS === "true",
  wishlist: process.env.ENABLE_WISHLIST === "true",
  advancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS === "true",
  bulkOperations: process.env.ENABLE_BULK_OPERATIONS === "true",
  exportFeatures: process.env.ENABLE_EXPORT_FEATURES === "true",
  previewMode: true, // Always enabled
  arPreview: true, // Always enabled
  productPreview: true, // Always enabled
  eyeIconPreview: true, // Always enabled
}

// Localization Configuration
export const I18N_CONFIG = {
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "th",
  supportedLocales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || "th,en").split(","),
  currency: {
    code: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "THB",
    symbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "฿",
  },
}

// Development Configuration
export const DEV_CONFIG = {
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
  mockServices: process.env.ENABLE_MOCK_SERVICES === "true",
  qaBypass: process.env.QA_BYPASS_AUTH === "1",
  skipEmailVerification: process.env.SKIP_EMAIL_VERIFICATION === "true",
  enableTestRoutes: process.env.ENABLE_TEST_ROUTES === "true",
}

// Analytics Configuration
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

// Security Configuration
export const SECURITY_CONFIG = {
  csrfSecret: process.env.CSRF_SECRET || "fallback-csrf-secret-for-development",
  rateLimiting: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    authMaxRequests: 20,
  },
  headers: {
    frameOptions: "DENY",
    contentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
    xssProtection: "1; mode=block",
  },
}

// Notification Configuration
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

// Export all configurations
export const CONFIG = {
  app: APP_CONFIG,
  database: DATABASE_CONFIG,
  auth: AUTH_CONFIG,
  email: EMAIL_CONFIG,
  upload: UPLOAD_CONFIG,
  payment: PAYMENT_CONFIG,
  shipping: SHIPPING_CONFIG,
  business: BUSINESS_CONFIG,
  features: FEATURE_FLAGS,
  i18n: I18N_CONFIG,
  dev: DEV_CONFIG,
  analytics: ANALYTICS_CONFIG,
  security: SECURITY_CONFIG,
  notifications: NOTIFICATION_CONFIG,
}

// Log configuration on startup (server-side only)
if (typeof window === "undefined") {
  logger.group("⚙️ Application Configuration")
  logger.info("App Name:", APP_CONFIG.name)
  logger.info("Environment:", process.env.NODE_ENV)
  logger.info("Database:", DATABASE_CONFIG.useSupabase ? "Supabase" : "Mock")
  logger.info("Email:", EMAIL_CONFIG.useMock ? "Mock" : "SMTP")
  logger.info("Upload:", UPLOAD_CONFIG.useMock ? "Mock" : "Vercel Blob")
  logger.info("Demo Mode:", DEV_CONFIG.demoMode)
  logger.info("QA Bypass:", DEV_CONFIG.qaBypass)
  logger.groupEnd()
}

export default CONFIG
