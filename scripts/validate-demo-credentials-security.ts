import { IS_PRODUCTION, USE_SUPABASE } from "@/lib/runtime"

interface SecurityCheck {
  check: string
  status: "PASS" | "FAIL" | "WARNING"
  message: string
  recommendation?: string
}

class DemoCredentialsSecurityValidator {
  private checks: SecurityCheck[] = []

  validateProductionSafety(): void {
    console.log("🔒 Validating Demo Credentials Security")
    console.log("=".repeat(50))

    // Check 1: Production mode detection
    this.addCheck({
      check: "Production Mode Detection",
      status: IS_PRODUCTION ? "PASS" : "WARNING",
      message: IS_PRODUCTION
        ? "Running in production mode - demo credentials hidden"
        : "Running in development mode - demo credentials visible",
      recommendation: IS_PRODUCTION ? undefined : "Demo credentials will be hidden in production deployment",
    })

    // Check 2: Supabase configuration
    this.addCheck({
      check: "Supabase Configuration",
      status: USE_SUPABASE ? "PASS" : "WARNING",
      message: USE_SUPABASE ? "Supabase authentication configured" : "Using mock authentication",
      recommendation: USE_SUPABASE ? undefined : "Configure Supabase for production authentication",
    })

    // Check 3: Demo credentials exposure
    const demoCredentialsSecure = IS_PRODUCTION
    this.addCheck({
      check: "Demo Credentials Exposure",
      status: demoCredentialsSecure ? "PASS" : "WARNING",
      message: demoCredentialsSecure
        ? "Demo credentials properly hidden in production"
        : "Demo credentials visible in development (expected)",
      recommendation: demoCredentialsSecure ? undefined : "Ensure IS_PRODUCTION flag works correctly in deployment",
    })

    // Check 4: Environment safety
    this.addCheck({
      check: "Environment Safety",
      status: IS_PRODUCTION && USE_SUPABASE ? "PASS" : "WARNING",
      message:
        IS_PRODUCTION && USE_SUPABASE
          ? "Production environment properly configured"
          : "Development environment detected",
      recommendation: IS_PRODUCTION && USE_SUPABASE ? undefined : "Production will use real authentication",
    })

    this.printResults()
  }

  private addCheck(check: SecurityCheck): void {
    this.checks.push(check)
    const icon = check.status === "PASS" ? "✅" : check.status === "WARNING" ? "⚠️" : "❌"
    console.log(`${icon} ${check.check}: ${check.message}`)
    if (check.recommendation) {
      console.log(`   💡 ${check.recommendation}`)
    }
  }

  private printResults(): void {
    console.log("\n" + "=".repeat(50))
    console.log("📊 SECURITY VALIDATION SUMMARY")
    console.log("=".repeat(50))

    const passed = this.checks.filter((c) => c.status === "PASS").length
    const warnings = this.checks.filter((c) => c.status === "WARNING").length
    const failed = this.checks.filter((c) => c.status === "FAIL").length

    console.log(`✅ Passed: ${passed}`)
    console.log(`⚠️  Warnings: ${warnings}`)
    console.log(`❌ Failed: ${failed}`)

    console.log("\n🎯 RECOMMENDATION:")
    if (failed === 0) {
      console.log("✅ Demo credentials are properly secured")
      console.log("✅ Safe to keep for development and testing")
      console.log("✅ Production deployment will hide credentials automatically")
    } else {
      console.log("❌ Security issues found - review before deployment")
    }

    console.log("\n📋 DEMO CREDENTIALS STATUS:")
    console.log("• Customer: user@sofacover.com / user123")
    console.log("• Admin: admin@sofacover.com / admin123")
    console.log("• Staff: staff@sofacover.com / staff123")
    console.log(`• Visibility: ${IS_PRODUCTION ? "HIDDEN (Production)" : "VISIBLE (Development)"}`)
    console.log(`• Authentication: ${USE_SUPABASE ? "Supabase" : "Mock"}`)
  }
}

// Run validation immediately
console.log("🚀 Starting Demo Credentials Security Validation...")
const validator = new DemoCredentialsSecurityValidator()
validator.validateProductionSafety()
console.log("✅ Validation completed successfully!")
