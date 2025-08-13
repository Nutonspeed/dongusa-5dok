import { logger } from "@/lib/logger"
import { CONFIG } from "@/lib/config"
import { databaseClient } from "@/lib/database-client"
import { emailService } from "@/lib/email"
import { uploadService } from "@/lib/upload"

interface SetupCheck {
  name: string
  category: string
  required: boolean
  check: () => Promise<{ success: boolean; message: string; details?: any }>
}

const SETUP_CHECKS: SetupCheck[] = [
  // Database Checks
  {
    name: "Database Connection",
    category: "Database",
    required: true,
    check: async () => {
      try {
        const health = await databaseClient.healthCheck()
        return {
          success: health.status === "healthy",
          message: health.status === "healthy" ? "Database connected successfully" : "Database connection failed",
          details: health.details,
        }
      } catch (error) {
        return {
          success: false,
          message: "Database connection error",
          details: error instanceof Error ? error.message : "Unknown error",
        }
      }
    },
  },

  // Email Service Checks
  {
    name: "Email Service",
    category: "Email",
    required: false,
    check: async () => {
      try {
        if (CONFIG.email.useMock) {
          return {
            success: true,
            message: "Using mock email service (development)",
            details: { provider: "mock" },
          }
        }

        const isConnected = await emailService.testConnection()
        return {
          success: isConnected,
          message: isConnected ? "Email service connected" : "Email service connection failed",
          details: { provider: "smtp", host: CONFIG.email.smtp.host },
        }
      } catch (error) {
        return {
          success: false,
          message: "Email service error",
          details: error instanceof Error ? error.message : "Unknown error",
        }
      }
    },
  },

  // Upload Service Checks
  {
    name: "Upload Service",
    category: "Storage",
    required: false,
    check: async () => {
      try {
        if (CONFIG.upload.useMock) {
          return {
            success: true,
            message: "Using mock upload service (development)",
            details: { provider: "mock" },
          }
        }

        // Test upload service by checking if we can initialize storage
        await uploadService.initializeStorage()
        return {
          success: true,
          message: "Upload service initialized",
          details: { provider: "vercel-blob" },
        }
      } catch (error) {
        return {
          success: false,
          message: "Upload service error",
          details: error instanceof Error ? error.message : "Unknown error",
        }
      }
    },
  },

  // Environment Variables Check
  {
    name: "Environment Variables",
    category: "Configuration",
    required: true,
    check: async () => {
      const missing: string[] = []
      const warnings: string[] = []

      // Critical environment variables
      const critical = ["NEXT_PUBLIC_SITE_URL", "NEXTAUTH_SECRET"]

      // Production-required variables
      const productionRequired = [
        ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"],
        ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY"],
        "SMTP_HOST",
        "BLOB_READ_WRITE_TOKEN",
      ]

      for (const key of critical) {
        if (!process.env[key]) {
          missing.push(key)
        }
      }

      if (process.env.NODE_ENV === "production") {
        for (const key of productionRequired) {
          if (Array.isArray(key)) {
            if (!key.some((k) => process.env[k])) {
              warnings.push(key[0])
            }
          } else if (!process.env[key]) {
            warnings.push(key)
          }
        }
      }

      return {
        success: missing.length === 0,
        message:
          missing.length === 0
            ? `Environment configured (${warnings.length} warnings)`
            : `Missing ${missing.length} critical variables`,
        details: { missing, warnings },
      }
    },
  },

  // Security Checks
  {
    name: "Security Configuration",
    category: "Security",
    required: true,
    check: async () => {
      const issues: string[] = []
      const warnings: string[] = []

      // Check for production security issues
      if (process.env.NODE_ENV === "production") {
        if (process.env.QA_BYPASS_AUTH === "1") {
          issues.push("QA_BYPASS_AUTH enabled in production")
        }
        if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
          warnings.push("Demo mode enabled in production")
        }
        if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
          issues.push("NEXTAUTH_SECRET too short or missing")
        }
      }

      // Check development security
      if (process.env.NODE_ENV === "development") {
        if (!process.env.QA_BYPASS_AUTH) {
          warnings.push("QA_BYPASS_AUTH not set (may need manual auth)")
        }
      }

      return {
        success: issues.length === 0,
        message:
          issues.length === 0
            ? `Security configured (${warnings.length} warnings)`
            : `${issues.length} security issues found`,
        details: { issues, warnings },
      }
    },
  },

  // Feature Flags Check
  {
    name: "Feature Configuration",
    category: "Features",
    required: false,
    check: async () => {
      const enabledFeatures = Object.entries(CONFIG.features)
        .filter(([_, enabled]) => enabled)
        .map(([feature, _]) => feature)

      const disabledFeatures = Object.entries(CONFIG.features)
        .filter(([_, enabled]) => !enabled)
        .map(([feature, _]) => feature)

      return {
        success: true,
        message: `${enabledFeatures.length} features enabled, ${disabledFeatures.length} disabled`,
        details: { enabled: enabledFeatures, disabled: disabledFeatures },
      }
    },
  },

  // Business Configuration Check
  {
    name: "Business Settings",
    category: "Business",
    required: false,
    check: async () => {
      const config = CONFIG.business
      const missing: string[] = []

      if (!config.store.phone || config.store.phone === "02-123-4567") {
        missing.push("store phone")
      }
      if (!config.store.address || config.store.address.includes("123 ถนนสุขุมวิท")) {
        missing.push("store address")
      }

      return {
        success: missing.length === 0,
        message:
          missing.length === 0 ? "Business settings configured" : `${missing.length} business settings need updating`,
        details: { missing, current: config.store },
      }
    },
  },
]

export interface SetupResult {
  success: boolean
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
  results: Array<{
    name: string
    category: string
    required: boolean
    success: boolean
    message: string
    details?: any
  }>
  recommendations: string[]
}

export async function validateSetup(): Promise<SetupResult> {
  logger.group("🔍 System Setup Validation")

  const results: SetupResult["results"] = []
  const recommendations: string[] = []
  let passed = 0
  let failed = 0
  let warnings = 0

  for (const check of SETUP_CHECKS) {
    logger.info(`Checking ${check.name}...`)

    try {
      const result = await check.check()

      results.push({
        name: check.name,
        category: check.category,
        required: check.required,
        success: result.success,
        message: result.message,
        details: result.details,
      })

      if (result.success) {
        passed++
        logger.info(`✅ ${check.name}: ${result.message}`)
      } else {
        if (check.required) {
          failed++
          logger.error(`❌ ${check.name}: ${result.message}`)
        } else {
          warnings++
          logger.warn(`⚠️ ${check.name}: ${result.message}`)
        }
      }

      // Add specific recommendations
      if (!result.success) {
        switch (check.name) {
          case "Database Connection":
            recommendations.push("Set up Supabase database or enable mock database for development")
            break
          case "Email Service":
            recommendations.push("Configure SMTP settings or use mock email for development")
            break
          case "Upload Service":
            recommendations.push("Set up Vercel Blob storage or enable mock upload for development")
            break
          case "Environment Variables":
            if (result.details?.missing?.length > 0) {
              recommendations.push(`Set missing environment variables: ${result.details.missing.join(", ")}`)
            }
            break
          case "Security Configuration":
            if (result.details?.issues?.length > 0) {
              recommendations.push(`Fix security issues: ${result.details.issues.join(", ")}`)
            }
            break
          case "Business Settings":
            recommendations.push("Update business information in environment variables")
            break
        }
      }
    } catch (error) {
      failed++
      logger.error(`❌ ${check.name}: Check failed`, error)

      results.push({
        name: check.name,
        category: check.category,
        required: check.required,
        success: false,
        message: "Check failed with error",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const success = failed === 0
  const summary = {
    total: SETUP_CHECKS.length,
    passed,
    failed,
    warnings,
  }

  logger.info(`📊 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`)

  if (success) {
    logger.info("✅ System setup validation completed successfully")
  } else {
    logger.error(`❌ System setup validation failed with ${failed} critical issues`)
  }

  // Add general recommendations
  if (process.env.NODE_ENV === "development") {
    recommendations.push("Copy .env.example to .env.local and configure for development")
  }

  if (process.env.NODE_ENV === "production") {
    recommendations.push("Ensure all production environment variables are set")
    recommendations.push("Review security settings before deployment")
  }

  logger.groupEnd()

  return {
    success,
    summary,
    results,
    recommendations: [...new Set(recommendations)], // Remove duplicates
  }
}

// Auto-validate on import in server environment
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  // Run validation after a short delay to allow other modules to initialize
  setTimeout(async () => {
    try {
      const result = await validateSetup()

      if (!result.success && process.env.NODE_ENV === "production") {
        logger.error("🚨 CRITICAL: System setup validation failed in production!")

        // In production, we might want to exit or send alerts
        if (process.env.STRICT_SETUP_VALIDATION === "true") {
          process.exit(1)
        }
      }
    } catch (error) {
      logger.error("Setup validation error:", error)
    }
  }, 1000)
}

export default validateSetup
