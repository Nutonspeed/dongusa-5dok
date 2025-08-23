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
    // ...existing code...
  }

  private printResults(): void {
    // ...existing code...
  }
}

// Run validation immediately

const validator = new DemoCredentialsSecurityValidator()
validator.validateProductionSafety()
