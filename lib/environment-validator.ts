import { logger } from "@/lib/logger"
import { IS_PRODUCTION } from "@/lib/runtime"

interface EnvironmentCheck {
  key: string
  required: boolean
  production: boolean
  description: string
}

const ENVIRONMENT_CHECKS: EnvironmentCheck[] = [
  // Supabase
  { key: "NEXT_PUBLIC_SUPABASE_URL", required: true, production: true, description: "Supabase URL" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, production: true, description: "Supabase Anonymous Key" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: false, production: true, description: "Supabase Service Role Key" },

  // Database
  { key: "POSTGRES_URL", required: false, production: true, description: "PostgreSQL Connection URL" },

  // Email
  { key: "SMTP_HOST", required: false, production: true, description: "SMTP Host" },
  { key: "SMTP_USER", required: false, production: true, description: "SMTP Username" },
  { key: "SMTP_PASS", required: false, production: true, description: "SMTP Password" },

  // Security
  { key: "NEXTAUTH_SECRET", required: false, production: true, description: "NextAuth Secret" },
  { key: "NEXTAUTH_URL", required: false, production: true, description: "NextAuth URL" },

  // Development/QA
  { key: "QA_BYPASS_AUTH", required: false, production: false, description: "QA Authentication Bypass" },
  { key: "NEXT_PUBLIC_DEMO_MODE", required: false, production: false, description: "Demo Mode" },
]

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  missing: string[]
  summary: {
    total: number
    required: number
    missing: number
    warnings: number
  }
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const missing: string[] = []

  logger.group("🔍 Environment Validation")

  for (const check of ENVIRONMENT_CHECKS) {
    const value = process.env[check.key]
    const hasValue = value && value.trim() !== ""

    if (!hasValue) {
      missing.push(check.key)

      if (check.required || (IS_PRODUCTION && check.production)) {
        errors.push(`Missing required environment variable: ${check.key} (${check.description})`)
        logger.error(`❌ ${check.key}: Missing (Required)`)
      } else {
        warnings.push(`Optional environment variable not set: ${check.key} (${check.description})`)
        logger.warn(`⚠️ ${check.key}: Missing (Optional)`)
      }
    } else {
      logger.info(`✅ ${check.key}: Set`)

      // Special checks
      if (check.key === "QA_BYPASS_AUTH" && IS_PRODUCTION) {
        errors.push("🚨 CRITICAL: QA_BYPASS_AUTH must not be set in production!")
        logger.error(`🚨 ${check.key}: SECURITY VIOLATION - Set in production!`)
      }
    }
  }

  // Additional production checks
  if (IS_PRODUCTION) {
    if (process.env.NEXT_PUBLIC_USE_SUPABASE !== "true") {
      errors.push("Production must use Supabase database")
      logger.error('❌ NEXT_PUBLIC_USE_SUPABASE: Must be "true" in production')
    }

    if (process.env.NODE_ENV !== "production") {
      warnings.push('NODE_ENV should be "production" in production environment')
      logger.warn('⚠️ NODE_ENV: Not set to "production"')
    }
  }

  const summary = {
    total: ENVIRONMENT_CHECKS.length,
    required: ENVIRONMENT_CHECKS.filter((c) => c.required || (IS_PRODUCTION && c.production)).length,
    missing: missing.length,
    warnings: warnings.length,
  }

  const valid = errors.length === 0

  logger.info(
    `📊 Summary: ${summary.total} total, ${summary.required} required, ${summary.missing} missing, ${summary.warnings} warnings`,
  )

  if (valid) {
    logger.info("✅ Environment validation passed")
  } else {
    logger.error(`❌ Environment validation failed with ${errors.length} errors`)
  }

  logger.groupEnd()

  return {
    valid,
    errors,
    warnings,
    missing,
    summary,
  }
}

// Auto-validate on import in server environment
if (typeof window === "undefined") {
  const result = validateEnvironment()

  if (!result.valid && IS_PRODUCTION) {
    logger.error("🚨 CRITICAL: Environment validation failed in production!")
    process.exit(1)
  }
}

export default validateEnvironment
