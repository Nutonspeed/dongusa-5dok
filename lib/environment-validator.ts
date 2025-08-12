import { logger } from "@/lib/logger"

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  recommendations: string[]
}

interface EnvironmentCheck {
  key: string
  required: boolean
  production?: boolean
  development?: boolean
  validator?: (value: string) => boolean
  description: string
}

const ENVIRONMENT_CHECKS: EnvironmentCheck[] = [
  // Critical Application Settings
  {
    key: "NODE_ENV",
    required: true,
    validator: (value) => ["development", "production", "test"].includes(value),
    description: "Application environment",
  },
  {
    key: "NEXT_PUBLIC_SITE_URL",
    required: true,
    validator: (value) => value.startsWith("http"),
    description: "Site URL for absolute links",
  },
  {
    key: "NEXTAUTH_SECRET",
    required: true,
    validator: (value) => value.length >= 32,
    description: "NextAuth secret key (minimum 32 characters)",
  },

  // Database Configuration
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    required: false,
    production: true,
    validator: (value) => value.startsWith("https://"),
    description: "Supabase project URL",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: false,
    production: true,
    validator: (value) => value.length > 100,
    description: "Supabase anonymous key",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    required: false,
    production: true,
    validator: (value) => value.length > 100,
    description: "Supabase service role key",
  },

  // Email Configuration
  {
    key: "SMTP_HOST",
    required: false,
    production: true,
    description: "SMTP server hostname",
  },
  {
    key: "SMTP_USER",
    required: false,
    production: true,
    description: "SMTP username",
  },
  {
    key: "SMTP_PASS",
    required: false,
    production: true,
    description: "SMTP password",
  },

  // File Upload
  {
    key: "BLOB_READ_WRITE_TOKEN",
    required: false,
    production: true,
    description: "Vercel Blob storage token",
  },

  // Security Keys
  {
    key: "JWT_SECRET",
    required: false,
    validator: (value) => value.length >= 32,
    description: "JWT signing secret",
  },
  {
    key: "ENCRYPTION_KEY",
    required: false,
    validator: (value) => value.length >= 32,
    description: "Data encryption key",
  },

  // Business Information
  {
    key: "STORE_NAME",
    required: false,
    description: "Store name",
  },
  {
    key: "STORE_PHONE",
    required: false,
    validator: (value) => !value.includes("123-4567"),
    description: "Store phone number",
  },
  {
    key: "ADMIN_EMAIL",
    required: false,
    validator: (value) => value.includes("@") && !value.includes("localhost"),
    description: "Admin email address",
  },

  // Development Settings
  {
    key: "QA_BYPASS_AUTH",
    required: false,
    development: true,
    validator: (value) => ["0", "1"].includes(value),
    description: "QA authentication bypass",
  },
]

export function validateEnvironment(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  const isProduction = process.env.NODE_ENV === "production"
  const isDevelopment = process.env.NODE_ENV === "development"

  logger.group("🔍 Environment Validation")

  for (const check of ENVIRONMENT_CHECKS) {
    const value = process.env[check.key]
    const hasValue = value && value.trim() !== ""

    // Check if required
    if (check.required && !hasValue) {
      errors.push(`Missing required environment variable: ${check.key}`)
      continue
    }

    // Check production requirements
    if (isProduction && check.production && !hasValue) {
      warnings.push(`Missing production environment variable: ${check.key}`)
      recommendations.push(`Set ${check.key} for production deployment`)
      continue
    }

    // Check development requirements
    if (isDevelopment && check.development && !hasValue) {
      warnings.push(`Missing development environment variable: ${check.key}`)
      continue
    }

    // Validate value if present
    if (hasValue && check.validator && !check.validator(value)) {
      errors.push(`Invalid value for ${check.key}: ${check.description}`)
      continue
    }

    // Log successful validation
    if (hasValue) {
      logger.info(`✅ ${check.key}: ${check.description}`)
    }
  }

  // Production-specific checks
  if (isProduction) {
    // Security checks
    if (process.env.QA_BYPASS_AUTH === "1") {
      errors.push("QA_BYPASS_AUTH must not be enabled in production")
    }

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      warnings.push("Demo mode is enabled in production")
    }

    if (process.env.ENABLE_MOCK_SERVICES === "true") {
      warnings.push("Mock services are enabled in production")
    }

    // Database checks
    if (process.env.NEXT_PUBLIC_USE_SUPABASE !== "true") {
      warnings.push("Not using Supabase in production")
      recommendations.push("Enable Supabase for production database")
    }
  }

  // Development-specific checks
  if (isDevelopment) {
    if (!process.env.QA_BYPASS_AUTH) {
      recommendations.push("Set QA_BYPASS_AUTH=1 for easier development")
    }

    if (process.env.NEXT_PUBLIC_USE_SUPABASE === "true" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      warnings.push("Supabase enabled but URL not configured")
      recommendations.push("Set Supabase credentials or disable with NEXT_PUBLIC_USE_SUPABASE=false")
    }
  }

  // General recommendations
  if (!process.env.STORE_PHONE || process.env.STORE_PHONE.includes("123-4567")) {
    recommendations.push("Update STORE_PHONE with your actual phone number")
  }

  if (!process.env.STORE_ADDRESS || process.env.STORE_ADDRESS.includes("123 ถนนสุขุมวิท")) {
    recommendations.push("Update STORE_ADDRESS with your actual address")
  }

  if (!process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL.includes("localhost")) {
    recommendations.push("Update ADMIN_EMAIL with your actual email")
  }

  // Log summary
  logger.info(`📊 Validation Summary:`)
  logger.info(`  Errors: ${errors.length}`)
  logger.info(`  Warnings: ${warnings.length}`)
  logger.info(`  Recommendations: ${recommendations.length}`)

  if (errors.length > 0) {
    logger.error("❌ Environment validation failed")
    errors.forEach((error) => logger.error(`  - ${error}`))
  }

  if (warnings.length > 0) {
    logger.warn("⚠️ Environment warnings")
    warnings.forEach((warning) => logger.warn(`  - ${warning}`))
  }

  if (recommendations.length > 0) {
    logger.info("💡 Recommendations")
    recommendations.forEach((rec) => logger.info(`  - ${rec}`))
  }

  logger.groupEnd()

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations,
  }
}

// Auto-validate on import (server-side only)
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  const result = validateEnvironment()

  if (!result.isValid && process.env.NODE_ENV === "production") {
    logger.error("🚨 CRITICAL: Environment validation failed in production!")

    if (process.env.STRICT_ENV_VALIDATION === "true") {
      process.exit(1)
    }
  }
}

export default validateEnvironment
