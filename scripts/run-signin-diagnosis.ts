import { createClient } from "@supabase/supabase-js"
import { Redis } from "@upstash/redis"

interface SignInDiagnostic {
  timestamp: string
  testType: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
}

interface AuthSystemStatus {
  supabaseConnection: boolean
  redisConnection: boolean
  bruteForceProtection: boolean
  securityService: boolean
  environmentVariables: string[]
  missingVariables: string[]
}

class SignInDiagnosticTool {
  private supabase: any
  private redis: Redis | null = null
  private diagnostics: SignInDiagnostic[] = []

  constructor() {
    console.log("[v0] Initializing SignInDiagnosticTool...")

    // Initialize Supabase client
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      console.log("[v0] Supabase client initialized")
    } else {
      console.log("[v0] Supabase environment variables missing")
    }

    // Initialize Redis client
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      this.redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
      console.log("[v0] Redis client initialized")
    } else {
      console.log("[v0] Redis environment variables missing")
    }
  }

  private addDiagnostic(type: string, status: "success" | "error" | "warning", message: string, details?: any) {
    this.diagnostics.push({
      timestamp: new Date().toISOString(),
      testType: type,
      status,
      message,
      details,
    })
  }

  async checkSystemStatus(): Promise<AuthSystemStatus> {
    console.log("🔍 Checking authentication system status...")

    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "KV_REST_API_URL",
      "KV_REST_API_TOKEN",
    ]

    const presentVars = requiredEnvVars.filter((varName) => process.env[varName])
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    console.log("[v0] Environment variables check:", { presentVars, missingVars })

    // Test Supabase connection
    let supabaseConnection = false
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase.from("profiles").select("count").limit(1)
        supabaseConnection = !error
        this.addDiagnostic(
          "supabase-connection",
          supabaseConnection ? "success" : "error",
          supabaseConnection ? "Supabase connection successful" : `Supabase error: ${error?.message}`,
        )
        console.log("[v0] Supabase connection test:", supabaseConnection ? "SUCCESS" : "FAILED", error?.message)
      } else {
        this.addDiagnostic(
          "supabase-connection",
          "error",
          "Supabase client not initialized - missing environment variables",
        )
      }
    } catch (error) {
      console.log("[v0] Supabase connection error:", error)
      this.addDiagnostic("supabase-connection", "error", `Supabase connection failed: ${error}`)
    }

    // Test Redis connection
    let redisConnection = false
    try {
      if (this.redis) {
        await this.redis.ping()
        redisConnection = true
        this.addDiagnostic("redis-connection", "success", "Redis connection successful")
        console.log("[v0] Redis connection test: SUCCESS")
      } else {
        this.addDiagnostic("redis-connection", "error", "Redis client not initialized - missing environment variables")
      }
    } catch (error) {
      console.log("[v0] Redis connection error:", error)
      this.addDiagnostic("redis-connection", "error", `Redis connection failed: ${error}`)
    }

    return {
      supabaseConnection,
      redisConnection,
      bruteForceProtection: redisConnection,
      securityService: true,
      environmentVariables: presentVars,
      missingVariables: missingVars,
    }
  }

  async testCredentialValidation() {
    console.log("🔐 Testing credential validation...")

    const testCases = [
      {
        email: "admin@sofacover.com",
        password: "admin123",
        expected: "success",
        description: "Valid admin credentials",
      },
      {
        email: "nuttapong161@gmail.com",
        password: "127995803",
        expected: "unknown",
        description: "Test user credentials (nuttapong161@gmail.com)",
      },
      { email: "invalid@email.com", password: "wrongpass", expected: "error", description: "Invalid credentials" },
    ]

    for (const testCase of testCases) {
      try {
        console.log(`[v0] Testing credentials for: ${testCase.email}`)

        if (this.supabase) {
          const { data, error } = await this.supabase.auth.signInWithPassword({
            email: testCase.email,
            password: testCase.password,
          })

          if (error) {
            this.addDiagnostic(
              "credential-validation",
              testCase.expected === "error" ? "success" : "warning",
              `${testCase.description}: ${error.message}`,
              { email: testCase.email, errorCode: error.status },
            )
            console.log(`[v0] Login failed for ${testCase.email}:`, error.message)
          } else {
            this.addDiagnostic("credential-validation", "success", `${testCase.description}: Login successful`, {
              email: testCase.email,
              userId: data.user?.id,
            })
            console.log(`[v0] Login successful for ${testCase.email}:`, data.user?.id)

            // Sign out immediately
            await this.supabase.auth.signOut()
          }
        }
      } catch (error) {
        console.log(`[v0] Credential test error for ${testCase.email}:`, error)
        this.addDiagnostic("credential-validation", "error", `${testCase.description}: Unexpected error - ${error}`, {
          email: testCase.email,
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  async testUserRegistration() {
    console.log("👤 Testing user registration for nuttapong161@gmail.com...")

    const testEmail = "nuttapong161@gmail.com"
    const testPassword = "127995803"

    try {
      if (this.supabase) {
        // Check if user already exists
        const { data: existingUser } = await this.supabase.from("profiles").select("*").eq("email", testEmail).single()

        if (existingUser) {
          this.addDiagnostic("user-registration", "success", `User ${testEmail} already exists in database`, {
            userId: existingUser.id,
            role: existingUser.role,
          })
          console.log("[v0] User exists:", existingUser)
        } else {
          console.log("[v0] User does not exist, checking auth...")

          // Check in auth.users table using service role
          if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const adminClient = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY,
            )

            const { data: authUsers, error } = await adminClient.auth.admin.listUsers()
            const existingAuthUser = authUsers?.users.find((user) => user.email === testEmail)

            if (existingAuthUser) {
              this.addDiagnostic("user-registration", "warning", `User exists in auth but not in profiles table`, {
                userId: existingAuthUser.id,
                emailConfirmed: !!existingAuthUser.email_confirmed_at,
              })
              console.log("[v0] User exists in auth but not profiles:", existingAuthUser)
            } else {
              this.addDiagnostic("user-registration", "warning", `User ${testEmail} does not exist in system`)
              console.log("[v0] User does not exist in auth system")
            }
          }
        }
      }
    } catch (error) {
      console.log("[v0] User registration test error:", error)
      this.addDiagnostic("user-registration", "error", `User registration test failed: ${error}`)
    }
  }

  async runComprehensiveDiagnosis() {
    console.log("🚀 Starting comprehensive sign-in diagnosis...")
    console.log("=".repeat(60))

    try {
      // Run all diagnostic tests
      const systemStatus = await this.checkSystemStatus()
      await this.testCredentialValidation()
      await this.testUserRegistration()

      // Generate report
      console.log("\n📊 DIAGNOSTIC REPORT")
      console.log("=".repeat(60))

      console.log("\n🔧 System Status:")
      console.log(`  Supabase Connection: ${systemStatus.supabaseConnection ? "✅" : "❌"}`)
      console.log(`  Redis Connection: ${systemStatus.redisConnection ? "✅" : "❌"}`)
      console.log(`  Brute Force Protection: ${systemStatus.bruteForceProtection ? "✅" : "❌"}`)
      console.log(`  Security Service: ${systemStatus.securityService ? "✅" : "❌"}`)

      console.log("\n🔑 Environment Variables:")
      console.log(`  Present: ${systemStatus.environmentVariables.length}/5`)
      systemStatus.environmentVariables.forEach((varName) => {
        console.log(`    ✅ ${varName}`)
      })
      systemStatus.missingVariables.forEach((varName) => {
        console.log(`    ❌ ${varName}`)
      })

      console.log("\n📋 Test Results:")
      const groupedDiagnostics = this.diagnostics.reduce(
        (acc, diag) => {
          if (!acc[diag.testType]) acc[diag.testType] = []
          acc[diag.testType].push(diag)
          return acc
        },
        {} as Record<string, SignInDiagnostic[]>,
      )

      Object.entries(groupedDiagnostics).forEach(([testType, diagnostics]) => {
        console.log(`\n  ${testType.toUpperCase()}:`)
        diagnostics.forEach((diag) => {
          const icon = diag.status === "success" ? "✅" : diag.status === "error" ? "❌" : "⚠️"
          console.log(`    ${icon} ${diag.message}`)
          if (diag.details) {
            console.log(`       Details: ${JSON.stringify(diag.details, null, 2)}`)
          }
        })
      })

      // Summary and recommendations
      console.log("\n💡 RECOMMENDATIONS:")
      console.log("=".repeat(60))

      const errors = this.diagnostics.filter((d) => d.status === "error")
      const warnings = this.diagnostics.filter((d) => d.status === "warning")

      if (errors.length === 0 && warnings.length === 0) {
        console.log("✅ All systems operational! No issues detected.")
      } else {
        if (errors.length > 0) {
          console.log("\n🚨 CRITICAL ISSUES:")
          errors.forEach((error) => {
            console.log(`  • ${error.message}`)
          })
        }

        if (warnings.length > 0) {
          console.log("\n⚠️ WARNINGS:")
          warnings.forEach((warning) => {
            console.log(`  • ${warning.message}`)
          })
        }

        console.log("\n🔧 SUGGESTED FIXES:")
        if (!systemStatus.supabaseConnection) {
          console.log("  1. Check Supabase environment variables and project settings")
          console.log("  2. Verify Supabase project is active and accessible")
        }
        if (!systemStatus.redisConnection) {
          console.log("  3. Check Redis environment variables")
          console.log("  4. Verify Redis instance is active and accessible")
        }
        if (systemStatus.missingVariables.length > 0) {
          console.log("  5. Add missing environment variables to your project")
        }
      }

      console.log("\n🎯 SPECIFIC SIGN-IN TROUBLESHOOTING:")
      console.log("  • For user nuttapong161@gmail.com:")
      console.log("    - Check if user exists in Supabase Auth")
      console.log("    - Verify email confirmation status")
      console.log("    - Check profile role assignment")
      console.log("    - Test password reset if needed")
      console.log("  • For admin access issues:")
      console.log("    - Verify admin role in profiles table")
      console.log("    - Check middleware authentication flow")
      console.log("    - Test admin route protection")

      console.log("\n" + "=".repeat(60))
      console.log("Diagnosis completed at:", new Date().toLocaleString())
    } catch (error) {
      console.error("❌ Diagnosis failed:", error)
      console.log("[v0] Full error details:", error)
    }
  }
}

async function runSignInDiagnosis() {
  console.log("🔍 Starting comprehensive sign-in diagnosis...")

  try {
    const diagnostic = new SignInDiagnosticTool()
    await diagnostic.runComprehensiveDiagnosis()
  } catch (error) {
    console.error("❌ Diagnosis failed:", error)
    console.log("[v0] Error details:", error)
  }
}

runSignInDiagnosis()
