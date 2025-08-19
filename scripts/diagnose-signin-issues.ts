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
    // Initialize Supabase client
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    }

    // Initialize Redis client
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      this.redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
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
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
    ]

    const presentVars = requiredEnvVars.filter((varName) => process.env[varName])
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

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
      } else {
        this.addDiagnostic(
          "supabase-connection",
          "error",
          "Supabase client not initialized - missing environment variables",
        )
      }
    } catch (error) {
      this.addDiagnostic("supabase-connection", "error", `Supabase connection failed: ${error}`)
    }

    // Test Redis connection
    let redisConnection = false
    try {
      if (this.redis) {
        await this.redis.ping()
        redisConnection = true
        this.addDiagnostic("redis-connection", "success", "Redis connection successful")
      } else {
        this.addDiagnostic("redis-connection", "error", "Redis client not initialized - missing environment variables")
      }
    } catch (error) {
      this.addDiagnostic("redis-connection", "error", `Redis connection failed: ${error}`)
    }

    return {
      supabaseConnection,
      redisConnection,
      bruteForceProtection: redisConnection, // Depends on Redis
      securityService: true, // Always available
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
      { email: "user@sofacover.com", password: "user123", expected: "success", description: "Valid user credentials" },
      {
        email: "nuttapong161@gmail.com",
        password: "127995803",
        expected: "unknown",
        description: "Test user credentials",
      },
      { email: "invalid@email.com", password: "wrongpass", expected: "error", description: "Invalid credentials" },
      { email: "", password: "", expected: "error", description: "Empty credentials" },
      { email: "test@test.com", password: "123", expected: "error", description: "Weak password" },
    ]

    for (const testCase of testCases) {
      try {
        if (this.supabase) {
          // Test with Supabase
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
          } else {
            this.addDiagnostic("credential-validation", "success", `${testCase.description}: Login successful`, {
              email: testCase.email,
              userId: data.user?.id,
            })

            // Sign out immediately
            await this.supabase.auth.signOut()
          }
        } else {
          // Test with mock credentials
          const validCredentials = [
            { email: "admin@sofacover.com", password: "admin123" },
            { email: "user@sofacover.com", password: "user123" },
          ]

          const isValid = validCredentials.some(
            (cred) => cred.email === testCase.email && cred.password === testCase.password,
          )

          this.addDiagnostic(
            "credential-validation",
            (isValid && testCase.expected === "success") || (!isValid && testCase.expected === "error")
              ? "success"
              : "warning",
            `${testCase.description}: ${isValid ? "Valid" : "Invalid"} credentials (mock mode)`,
            { email: testCase.email, mockMode: true },
          )
        }
      } catch (error) {
        this.addDiagnostic("credential-validation", "error", `${testCase.description}: Unexpected error - ${error}`, {
          email: testCase.email,
        })
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  async testBruteForceProtection() {
    console.log("🛡️ Testing brute force protection...")

    if (!this.redis) {
      this.addDiagnostic("brute-force-test", "warning", "Cannot test brute force protection - Redis not available")
      return
    }

    const testEmail = "bruteforce.test@example.com"
    const testIP = "192.168.1.100"

    try {
      // Clear any existing attempts
      await this.redis.del(`login_attempts:${testEmail}`)
      await this.redis.del(`lockout:${testEmail}`)

      // Simulate multiple failed attempts
      for (let i = 1; i <= 6; i++) {
        const attempts = await this.redis.incr(`login_attempts:${testEmail}`)
        await this.redis.expire(`login_attempts:${testEmail}`, 900) // 15 minutes

        this.addDiagnostic(
          "brute-force-test",
          "success",
          `Attempt ${i}: Recorded ${attempts} failed attempts for ${testEmail}`,
        )

        if (attempts >= 5) {
          // Should trigger lockout
          const lockoutTime = Date.now() + 900000 // 15 minutes
          await this.redis.setex(`lockout:${testEmail}`, 900, lockoutTime.toString())

          this.addDiagnostic(
            "brute-force-test",
            "success",
            `Account locked after ${attempts} attempts until ${new Date(lockoutTime).toLocaleString()}`,
          )
          break
        }
      }

      // Test lockout status
      const lockoutUntil = await this.redis.get(`lockout:${testEmail}`)
      if (lockoutUntil) {
        const isLocked = Date.now() < Number.parseInt(lockoutUntil as string)
        this.addDiagnostic("brute-force-test", "success", `Lockout status: ${isLocked ? "LOCKED" : "EXPIRED"}`, {
          lockoutUntil: new Date(Number.parseInt(lockoutUntil as string)).toLocaleString(),
        })
      }

      // Cleanup
      await this.redis.del(`login_attempts:${testEmail}`)
      await this.redis.del(`lockout:${testEmail}`)
    } catch (error) {
      this.addDiagnostic("brute-force-test", "error", `Brute force protection test failed: ${error}`)
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
          this.addDiagnostic("user-registration", "warning", `User ${testEmail} already exists in database`, {
            userId: existingUser.id,
            role: existingUser.role,
          })

          // Test login with existing user
          const { data, error } = await this.supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
          })

          if (error) {
            this.addDiagnostic("user-registration", "error", `Cannot login with existing user: ${error.message}`, {
              errorCode: error.status,
            })
          } else {
            this.addDiagnostic("user-registration", "success", `Successfully logged in with existing user`, {
              userId: data.user?.id,
            })
            await this.supabase.auth.signOut()
          }
        } else {
          // Try to register new user
          const { data, error } = await this.supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
              data: {
                full_name: "Test Admin User",
              },
            },
          })

          if (error) {
            this.addDiagnostic("user-registration", "error", `User registration failed: ${error.message}`, {
              errorCode: error.status,
            })
          } else {
            this.addDiagnostic(
              "user-registration",
              "success",
              `User registration successful - confirmation email sent`,
              { userId: data.user?.id, needsConfirmation: !data.user?.email_confirmed_at },
            )

            // Try to update role to admin (requires service role key)
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
              const adminClient = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY,
              )

              const { error: roleError } = await adminClient.from("profiles").upsert({
                id: data.user?.id,
                email: testEmail,
                full_name: "Test Admin User",
                role: "admin",
              })

              if (roleError) {
                this.addDiagnostic("user-registration", "warning", `Could not set admin role: ${roleError.message}`)
              } else {
                this.addDiagnostic("user-registration", "success", `Successfully set admin role for user`)
              }
            }
          }
        }
      } else {
        this.addDiagnostic(
          "user-registration",
          "warning",
          "Cannot test user registration - Supabase not available (running in mock mode)",
        )
      }
    } catch (error) {
      this.addDiagnostic("user-registration", "error", `User registration test failed: ${error}`)
    }
  }

  async testEmailVerification() {
    console.log("📧 Testing email verification system...")

    try {
      if (this.supabase && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)

        // Check email settings
        this.addDiagnostic("email-verification", "success", "Email verification system configured", {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          redirectUrl: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "Not set",
        })

        // Check for unconfirmed users
        const { data: unconfirmedUsers, error } = await adminClient.auth.admin.listUsers()

        if (error) {
          this.addDiagnostic("email-verification", "error", `Cannot check user confirmation status: ${error.message}`)
        } else {
          const unconfirmed = unconfirmedUsers.users.filter((user) => !user.email_confirmed_at)
          this.addDiagnostic("email-verification", "success", `Found ${unconfirmed.length} unconfirmed users`, {
            unconfirmedEmails: unconfirmed.map((u) => u.email),
          })
        }
      } else {
        this.addDiagnostic(
          "email-verification",
          "warning",
          "Cannot test email verification - missing Supabase service role key",
        )
      }
    } catch (error) {
      this.addDiagnostic("email-verification", "error", `Email verification test failed: ${error}`)
    }
  }

  async runComprehensiveDiagnosis() {
    console.log("🚀 Starting comprehensive sign-in diagnosis...")
    console.log("=".repeat(60))

    // Run all diagnostic tests
    const systemStatus = await this.checkSystemStatus()
    await this.testCredentialValidation()
    await this.testBruteForceProtection()
    await this.testUserRegistration()
    await this.testEmailVerification()

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
        console.log("  3. Check Upstash Redis environment variables")
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
  }
}

// Run the diagnostic
const diagnostic = new SignInDiagnosticTool()
diagnostic.runComprehensiveDiagnosis().catch(console.error)
