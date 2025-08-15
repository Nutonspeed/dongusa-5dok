#!/usr/bin/env tsx

import { logger } from "@/lib/logger"
import { validateEnvironment } from "@/lib/environment-validator"

interface ValidationResult {
  passed: boolean
  message: string
  details?: any
}

interface DeploymentValidation {
  environment: ValidationResult
  database: ValidationResult
  health: ValidationResult
  build: ValidationResult
  security: ValidationResult
  overall: ValidationResult
}

async function validateEnvironmentVariables(): Promise<ValidationResult> {
  try {
    logger.info("🔍 Validating environment variables...")
    const result = validateEnvironment()

    if (!result.isValid) {
      return {
        passed: false,
        message: `Environment validation failed with ${result.errors.length} errors`,
        details: { errors: result.errors, warnings: result.warnings },
      }
    }

    return {
      passed: true,
      message: `Environment validation passed with ${result.warnings.length} warnings`,
      details: { warnings: result.warnings, recommendations: result.recommendations },
    }
  } catch (error) {
    return {
      passed: false,
      message: "Environment validation threw an error",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

async function validateDatabaseConnectivity(): Promise<ValidationResult> {
  try {
    logger.info("🗄️ Validating database connectivity...")

    // Test database health endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/health/database`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        passed: false,
        message: `Database health check failed with status ${response.status}`,
        details: errorData,
      }
    }

    const healthData = await response.json()

    if (healthData.status !== "ok") {
      return {
        passed: false,
        message: "Database health check returned error status",
        details: healthData,
      }
    }

    return {
      passed: true,
      message: `Database connectivity validated (${healthData.queryTime}ms response time)`,
      details: healthData,
    }
  } catch (error) {
    return {
      passed: false,
      message: "Database connectivity test failed",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

async function validateHealthEndpoints(): Promise<ValidationResult> {
  try {
    logger.info("🏥 Validating health endpoints...")

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const endpoints = ["/api/health", "/api/health/database", "/api/health/supabase"]

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const response = await fetch(`${baseUrl}${endpoint}`)
        const data = await response.json().catch(() => ({}))
        return { endpoint, status: response.status, data }
      }),
    )

    const failures = results
      .map((result, index) => ({ result, endpoint: endpoints[index] }))
      .filter(
        ({ result }) => result.status === "rejected" || (result.status === "fulfilled" && result.value.status >= 400),
      )

    if (failures.length > 0) {
      return {
        passed: false,
        message: `${failures.length} health endpoints failed`,
        details: failures,
      }
    }

    return {
      passed: true,
      message: `All ${endpoints.length} health endpoints are responding`,
      details: results.map((result, index) => ({
        endpoint: endpoints[index],
        status: result.status === "fulfilled" ? result.value.status : "error",
      })),
    }
  } catch (error) {
    return {
      passed: false,
      message: "Health endpoints validation failed",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

async function validateBuildConfiguration(): Promise<ValidationResult> {
  try {
    logger.info("🔧 Validating build configuration...")

    const checks = []

    // Check if critical files exist
    const fs = await import("fs")
    const path = await import("path")

    const criticalFiles = ["next.config.mjs", "package.json", "tsconfig.json", "tailwind.config.ts"]

    for (const file of criticalFiles) {
      if (!fs.existsSync(path.join(process.cwd(), file))) {
        checks.push(`Missing critical file: ${file}`)
      }
    }

    // Check package.json scripts
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"))
    const requiredScripts = ["build", "start", "dev"]

    for (const script of requiredScripts) {
      if (!packageJson.scripts[script]) {
        checks.push(`Missing required script: ${script}`)
      }
    }

    if (checks.length > 0) {
      return {
        passed: false,
        message: `Build configuration has ${checks.length} issues`,
        details: checks,
      }
    }

    return {
      passed: true,
      message: "Build configuration is valid",
      details: { scripts: Object.keys(packageJson.scripts).length },
    }
  } catch (error) {
    return {
      passed: false,
      message: "Build configuration validation failed",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

async function validateSecurityConfiguration(): Promise<ValidationResult> {
  try {
    logger.info("🔒 Validating security configuration...")

    const issues = []

    // Check critical security environment variables
    const securityVars = ["NEXTAUTH_SECRET", "JWT_SECRET", "ENCRYPTION_KEY"]

    for (const varName of securityVars) {
      const value = process.env[varName]
      if (!value) {
        issues.push(`Missing security variable: ${varName}`)
      } else if (value.length < 32) {
        issues.push(`Security variable ${varName} is too short (minimum 32 characters)`)
      }
    }

    // Check production-specific security settings
    if (process.env.NODE_ENV === "production") {
      if (process.env.QA_BYPASS_AUTH === "1") {
        issues.push("QA_BYPASS_AUTH is enabled in production")
      }

      if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
        issues.push("Debug mode is enabled in production")
      }

      if (process.env.ENABLE_MOCK_SERVICES === "true") {
        issues.push("Mock services are enabled in production")
      }
    }

    if (issues.length > 0) {
      return {
        passed: false,
        message: `Security configuration has ${issues.length} issues`,
        details: issues,
      }
    }

    return {
      passed: true,
      message: "Security configuration is valid",
      details: { checkedVariables: securityVars.length },
    }
  } catch (error) {
    return {
      passed: false,
      message: "Security configuration validation failed",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

async function runDeploymentValidation(): Promise<DeploymentValidation> {
  logger.group("🚀 Production Deployment Validation")

  const [environment, database, health, build, security] = await Promise.all([
    validateEnvironmentVariables(),
    validateDatabaseConnectivity(),
    validateHealthEndpoints(),
    validateBuildConfiguration(),
    validateSecurityConfiguration(),
  ])

  const allPassed = [environment, database, health, build, security].every((result) => result.passed)

  const overall: ValidationResult = {
    passed: allPassed,
    message: allPassed
      ? "🎉 All deployment validations passed! Ready for production."
      : "❌ Some deployment validations failed. Review issues before deploying.",
    details: {
      totalChecks: 5,
      passed: [environment, database, health, build, security].filter((r) => r.passed).length,
      failed: [environment, database, health, build, security].filter((r) => !r.passed).length,
    },
  }

  logger.groupEnd()

  return {
    environment,
    database,
    health,
    build,
    security,
    overall,
  }
}

// Main execution
async function main() {
  try {
    const validation = await runDeploymentValidation()

    // Log results
    logger.info("\n" + "=".repeat(60))
    logger.info("📋 DEPLOYMENT VALIDATION REPORT")
    logger.info("=".repeat(60))

    const results = [
      { name: "Environment Variables", result: validation.environment },
      { name: "Database Connectivity", result: validation.database },
      { name: "Health Endpoints", result: validation.health },
      { name: "Build Configuration", result: validation.build },
      { name: "Security Configuration", result: validation.security },
    ]

    for (const { name, result } of results) {
      const status = result.passed ? "✅ PASS" : "❌ FAIL"
      logger.info(`${status} ${name}: ${result.message}`)

      if (!result.passed && result.details) {
        logger.error(`   Details: ${JSON.stringify(result.details, null, 2)}`)
      }
    }

    logger.info("=".repeat(60))
    logger.info(validation.overall.message)
    logger.info("=".repeat(60))

    // Exit with appropriate code
    process.exit(validation.overall.passed ? 0 : 1)
  } catch (error) {
    logger.error("❌ Deployment validation failed with error:", error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { runDeploymentValidation }
export type { DeploymentValidation, ValidationResult }
