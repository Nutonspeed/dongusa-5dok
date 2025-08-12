import { logger } from "@/lib/logger"

// Runtime configuration with safety checks
export const NODE_ENV = process.env.NODE_ENV || "development"
export const IS_PRODUCTION = NODE_ENV === "production"
export const IS_DEVELOPMENT = NODE_ENV === "development"

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

  if (IS_PRODUCTION && bypass) {
    logger.error("🚨 CRITICAL: QA_BYPASS_AUTH is enabled in production!")
    throw new Error("Security violation: QA bypass cannot be enabled in production")
  }

  if (bypass) {
    logger.warn("⚠️ QA_BYPASS_AUTH is enabled - authentication bypassed")
  }

  return bypass && !IS_PRODUCTION
})()

// Database configuration
export const DATABASE_CONFIG = {
  useSupabase: USE_SUPABASE,
  useMock: !USE_SUPABASE || IS_DEVELOPMENT,
  connectionTimeout: 10000,
  retryAttempts: 3,
}

// Email configuration
export const EMAIL_CONFIG = {
  useMock: IS_DEVELOPMENT || !process.env.SMTP_HOST,
  provider: process.env.SMTP_HOST ? "smtp" : "mock",
}

// Upload configuration
export const UPLOAD_CONFIG = {
  useMock: IS_DEVELOPMENT || !process.env.NEXT_PUBLIC_SUPABASE_URL,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
}

// Security configuration
export const SECURITY_CONFIG = {
  enableCSP: IS_PRODUCTION,
  enableRateLimit: true,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
}

// Log configuration on startup
if (typeof window === "undefined") {
  logger.group("🔧 Runtime Configuration")
  logger.info("Environment:", NODE_ENV)
  logger.info("Use Supabase:", USE_SUPABASE)
  logger.info("QA Bypass:", QA_BYPASS_AUTH)
  logger.info("Database:", DATABASE_CONFIG.useMock ? "Mock" : "Supabase")
  logger.info("Email:", EMAIL_CONFIG.useMock ? "Mock" : "SMTP")
  logger.groupEnd()
}

export default {
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  USE_SUPABASE,
  QA_BYPASS_AUTH,
  DATABASE_CONFIG,
  EMAIL_CONFIG,
  UPLOAD_CONFIG,
  SECURITY_CONFIG,
}
