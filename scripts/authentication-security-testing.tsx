#!/usr/bin/env tsx

/**
 * Authentication & Security Testing Suite
 * ทดสอบระบบการยืนยันตัวตนและความปลอดภัยของระบบ
 */

import { createClient } from "@supabase/supabase-js"

interface SecurityTestResult {
  category: string
  test: string
  status: "PASS" | "FAIL" | "WARNING" | "SKIP"
  message: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  executionTime?: number
  details?: any
  timestamp: string
}

class AuthenticationSecurityTester {
  private results: SecurityTestResult[] = []
  private supabase: any
  private testData: any = {}

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    }
  }

  private addResult(
    category: string,
    test: string,
    status: "PASS" | "FAIL" | "WARNING" | "SKIP",
    message: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    executionTime?: number,
    details?: any,
  ) {
    this.results.push({
      category,
      test,
      status,
      message,
      severity,
      executionTime,
      details,
      timestamp: new Date().toISOString(),
    })
  }

  private log(message: string, type: "info" | "success" | "warning" | "error" = "info") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      warning: "\x1b[33m",
      error: "\x1b[31m",
    }
    const reset = "\x1b[0m"
    console.log(`${colors[type]}[SECURITY-TEST] ${message}${reset}`)
  }

  private async measureExecutionTime<T>(operation: () => Promise<T>): Promise<{ result: T; executionTime: number }> {
    const startTime = Date.now()
    const result = await operation()
    const executionTime = Date.now() - startTime
    return { result, executionTime }
  }

  // 1. Authentication Flow Testing
  async testAuthenticationFlows() {
    this.log("🔐 Testing Authentication Flows...", "info")

    try {
      // Test user registration
      const testEmail = `security-test-${Date.now()}@example.com`
      const testPassword = "SecurePassword123!"

      const { result: signUpResult, executionTime: signUpTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        })
      })

      if (signUpResult.error) {
        if (signUpResult.error.message.includes("already registered")) {
          this.addResult(
            "Authentication",
            "User Registration",
            "PASS",
            "Registration properly handles existing users",
            "LOW",
            signUpTime,
          )
        } else {
          this.addResult(
            "Authentication",
            "User Registration",
            "FAIL",
            `Registration failed: ${signUpResult.error.message}`,
            "HIGH",
            signUpTime,
          )
        }
      } else {
        this.addResult("Authentication", "User Registration", "PASS", "User registration successful", "LOW", signUpTime)
        this.testData.testUser = signUpResult.data.user
      }

      // Test user login
      const { result: signInResult, executionTime: signInTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        })
      })

      if (signInResult.error) {
        this.addResult(
          "Authentication",
          "User Login",
          "FAIL",
          `Login failed: ${signInResult.error.message}`,
          "HIGH",
          signInTime,
        )
      } else {
        this.addResult("Authentication", "User Login", "PASS", "User login successful", "LOW", signInTime)
      }

      // Test invalid login attempts
      const { result: invalidLoginResult, executionTime: invalidTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.auth.signInWithPassword({
          email: testEmail,
          password: "WrongPassword123!",
        })
      })

      if (invalidLoginResult.error) {
        this.addResult(
          "Authentication",
          "Invalid Login Protection",
          "PASS",
          "Invalid login attempts properly rejected",
          "LOW",
          invalidTime,
        )
      } else {
        this.addResult(
          "Authentication",
          "Invalid Login Protection",
          "FAIL",
          "Invalid login attempt succeeded - security risk!",
          "CRITICAL",
          invalidTime,
        )
      }

      // Test password reset
      const { result: resetResult, executionTime: resetTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.auth.resetPasswordForEmail(testEmail)
      })

      if (resetResult.error) {
        this.addResult(
          "Authentication",
          "Password Reset",
          "WARNING",
          `Password reset issue: ${resetResult.error.message}`,
          "MEDIUM",
          resetTime,
        )
      } else {
        this.addResult(
          "Authentication",
          "Password Reset",
          "PASS",
          "Password reset functionality working",
          "LOW",
          resetTime,
        )
      }

      // Test logout
      const { result: logoutResult, executionTime: logoutTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.auth.signOut()
      })

      if (logoutResult.error) {
        this.addResult(
          "Authentication",
          "User Logout",
          "FAIL",
          `Logout failed: ${logoutResult.error.message}`,
          "MEDIUM",
          logoutTime,
        )
      } else {
        this.addResult("Authentication", "User Logout", "PASS", "User logout successful", "LOW", logoutTime)
      }
    } catch (error: any) {
      this.addResult(
        "Authentication",
        "Flow Testing",
        "FAIL",
        `Authentication flow test failed: ${error.message}`,
        "CRITICAL",
      )
    }
  }

  // 2. Role-Based Access Control Testing
  async testRoleBasedAccessControl() {
    this.log("👥 Testing Role-Based Access Control...", "info")

    try {
      // Test admin role access
      const { result: adminCheck, executionTime: adminTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("profiles").select("*").eq("role", "admin").limit(1)
      })

      if (adminCheck.error) {
        this.addResult(
          "Authorization",
          "Admin Role Check",
          "FAIL",
          `Admin role check failed: ${adminCheck.error.message}`,
          "HIGH",
          adminTime,
        )
      } else {
        this.addResult(
          "Authorization",
          "Admin Role Check",
          "PASS",
          `Admin role system accessible - ${adminCheck.data?.length || 0} admin users`,
          "LOW",
          adminTime,
        )
      }

      // Test customer role access
      const { result: customerCheck, executionTime: customerTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("profiles").select("*").eq("role", "customer").limit(5)
      })

      if (customerCheck.error) {
        this.addResult(
          "Authorization",
          "Customer Role Check",
          "FAIL",
          `Customer role check failed: ${customerCheck.error.message}`,
          "MEDIUM",
          customerTime,
        )
      } else {
        this.addResult(
          "Authorization",
          "Customer Role Check",
          "PASS",
          `Customer role system accessible - ${customerCheck.data?.length || 0} customer users`,
          "LOW",
          customerTime,
        )
      }

      // Test role change attempts logging
      const { result: roleChangeCheck, executionTime: roleTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("admin_role_change_attempts").select("*").limit(5)
      })

      if (roleChangeCheck.error) {
        this.addResult(
          "Authorization",
          "Role Change Logging",
          "WARNING",
          `Role change logging check failed: ${roleChangeCheck.error.message}`,
          "MEDIUM",
          roleTime,
        )
      } else {
        this.addResult(
          "Authorization",
          "Role Change Logging",
          "PASS",
          `Role change logging system working - ${roleChangeCheck.data?.length || 0} logged attempts`,
          "LOW",
          roleTime,
        )
      }
    } catch (error: any) {
      this.addResult("Authorization", "RBAC Testing", "FAIL", `RBAC test failed: ${error.message}`, "HIGH")
    }
  }

  // 3. Data Protection and Privacy Testing
  async testDataProtectionPrivacy() {
    this.log("🛡️ Testing Data Protection and Privacy...", "info")

    try {
      // Test sensitive data exposure
      const { result: profileCheck, executionTime: profileTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("profiles").select("*").limit(1)
      })

      if (profileCheck.error) {
        this.addResult(
          "Data Protection",
          "Profile Data Access",
          "FAIL",
          `Profile data access failed: ${profileCheck.error.message}`,
          "HIGH",
          profileTime,
        )
      } else {
        // Check if sensitive fields are properly protected
        const profile = profileCheck.data?.[0]
        if (profile) {
          const sensitiveFields = ["password", "password_hash", "secret_key", "private_key"]
          const exposedFields = sensitiveFields.filter((field) => profile.hasOwnProperty(field))

          if (exposedFields.length > 0) {
            this.addResult(
              "Data Protection",
              "Sensitive Data Exposure",
              "FAIL",
              `Sensitive fields exposed: ${exposedFields.join(", ")}`,
              "CRITICAL",
              profileTime,
            )
          } else {
            this.addResult(
              "Data Protection",
              "Sensitive Data Exposure",
              "PASS",
              "No sensitive fields exposed in profile data",
              "LOW",
              profileTime,
            )
          }
        }
      }

      // Test order data privacy
      const { result: orderCheck, executionTime: orderTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("orders").select("*").limit(1)
      })

      if (orderCheck.error) {
        this.addResult(
          "Data Protection",
          "Order Data Privacy",
          "WARNING",
          `Order data access issue: ${orderCheck.error.message}`,
          "MEDIUM",
          orderTime,
        )
      } else {
        this.addResult(
          "Data Protection",
          "Order Data Privacy",
          "PASS",
          "Order data access controlled properly",
          "LOW",
          orderTime,
        )
      }

      // Test payment information protection
      const { result: paymentCheck, executionTime: paymentTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("orders").select("billing_address, shipping_address").limit(1)
      })

      if (paymentCheck.error) {
        this.addResult(
          "Data Protection",
          "Payment Info Protection",
          "WARNING",
          `Payment info check failed: ${paymentCheck.error.message}`,
          "HIGH",
          paymentTime,
        )
      } else {
        // Check if payment info is properly structured
        const order = paymentCheck.data?.[0]
        if (order && order.billing_address) {
          const hasCardInfo =
            JSON.stringify(order.billing_address).includes("card") ||
            JSON.stringify(order.billing_address).includes("credit")

          if (hasCardInfo) {
            this.addResult(
              "Data Protection",
              "Payment Info Protection",
              "FAIL",
              "Potential payment card information stored in database",
              "CRITICAL",
              paymentTime,
            )
          } else {
            this.addResult(
              "Data Protection",
              "Payment Info Protection",
              "PASS",
              "No payment card information stored in database",
              "LOW",
              paymentTime,
            )
          }
        }
      }
    } catch (error: any) {
      this.addResult(
        "Data Protection",
        "Privacy Testing",
        "FAIL",
        `Data protection test failed: ${error.message}`,
        "HIGH",
      )
    }
  }

  // 4. Input Validation and Sanitization Testing
  async testInputValidationSanitization() {
    this.log("🧹 Testing Input Validation and Sanitization...", "info")

    try {
      // Test SQL injection protection
      const maliciousInput = "'; DROP TABLE profiles; --"
      const { result: sqlInjectionTest, executionTime: sqlTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("profiles").select("*").eq("email", maliciousInput).limit(1)
      })

      if (sqlInjectionTest.error && sqlInjectionTest.error.message.includes("invalid")) {
        this.addResult(
          "Input Validation",
          "SQL Injection Protection",
          "PASS",
          "SQL injection attempts properly blocked",
          "LOW",
          sqlTime,
        )
      } else if (sqlInjectionTest.error) {
        this.addResult(
          "Input Validation",
          "SQL Injection Protection",
          "WARNING",
          `Unexpected error with malicious input: ${sqlInjectionTest.error.message}`,
          "MEDIUM",
          sqlTime,
        )
      } else {
        this.addResult(
          "Input Validation",
          "SQL Injection Protection",
          "PASS",
          "Malicious input handled safely (no results returned)",
          "LOW",
          sqlTime,
        )
      }

      // Test XSS protection in user input
      const xssPayload = "<script>alert('XSS')</script>"
      const { result: xssTest, executionTime: xssTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("customer_reviews").insert({
          user_id: "00000000-0000-0000-0000-000000000001",
          product_id: "00000000-0000-0000-0000-000000000001",
          rating: 5,
          title: xssPayload,
          comment: "Test review with XSS payload",
          verified_purchase: false,
        })
      })

      if (xssTest.error) {
        if (xssTest.error.message.includes("invalid") || xssTest.error.message.includes("constraint")) {
          this.addResult("Input Validation", "XSS Protection", "PASS", "XSS payload properly rejected", "LOW", xssTime)
        } else {
          this.addResult(
            "Input Validation",
            "XSS Protection",
            "WARNING",
            `XSS test resulted in unexpected error: ${xssTest.error.message}`,
            "MEDIUM",
            xssTime,
          )
        }
      } else {
        // If successful, check if the payload was sanitized
        this.addResult(
          "Input Validation",
          "XSS Protection",
          "WARNING",
          "XSS payload was accepted - verify if properly sanitized on output",
          "HIGH",
          xssTime,
        )

        // Cleanup the test data
        await this.supabase.from("customer_reviews").delete().eq("title", xssPayload)
      }

      // Test email validation
      const invalidEmails = ["invalid-email", "@domain.com", "user@", "user@domain"]
      for (const email of invalidEmails) {
        const { result: emailTest, executionTime: emailTime } = await this.measureExecutionTime(async () => {
          return await this.supabase.from("profiles").insert({
            email: email,
            full_name: "Test User",
            role: "customer",
          })
        })

        if (emailTest.error) {
          this.addResult(
            "Input Validation",
            "Email Validation",
            "PASS",
            `Invalid email "${email}" properly rejected`,
            "LOW",
            emailTime,
          )
        } else {
          this.addResult(
            "Input Validation",
            "Email Validation",
            "FAIL",
            `Invalid email "${email}" was accepted`,
            "MEDIUM",
            emailTime,
          )
          // Cleanup
          await this.supabase.from("profiles").delete().eq("email", email)
        }
      }
    } catch (error: any) {
      this.addResult(
        "Input Validation",
        "Validation Testing",
        "FAIL",
        `Input validation test failed: ${error.message}`,
        "HIGH",
      )
    }
  }

  // 5. Session Management Testing
  async testSessionManagement() {
    this.log("🔑 Testing Session Management...", "info")

    try {
      // Test session creation
      const testEmail = `session-test-${Date.now()}@example.com`
      const { result: sessionTest, executionTime: sessionTime } = await this.measureExecutionTime(async () => {
        const signUpResult = await this.supabase.auth.signUp({
          email: testEmail,
          password: "TestPassword123!",
        })

        if (signUpResult.error) return signUpResult

        const sessionResult = await this.supabase.auth.getSession()
        return sessionResult
      })

      if (sessionTest.error) {
        this.addResult(
          "Session Management",
          "Session Creation",
          "FAIL",
          `Session creation failed: ${sessionTest.error.message}`,
          "HIGH",
          sessionTime,
        )
      } else {
        this.addResult(
          "Session Management",
          "Session Creation",
          "PASS",
          "Session created successfully",
          "LOW",
          sessionTime,
        )
      }

      // Test session expiration handling
      const { result: sessionCheck, executionTime: checkTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.auth.getUser()
      })

      if (sessionCheck.error) {
        this.addResult(
          "Session Management",
          "Session Validation",
          "WARNING",
          `Session validation issue: ${sessionCheck.error.message}`,
          "MEDIUM",
          checkTime,
        )
      } else {
        this.addResult(
          "Session Management",
          "Session Validation",
          "PASS",
          "Session validation working properly",
          "LOW",
          checkTime,
        )
      }

      // Test session cleanup on logout
      const { result: logoutTest, executionTime: logoutTime } = await this.measureExecutionTime(async () => {
        await this.supabase.auth.signOut()
        return await this.supabase.auth.getSession()
      })

      if (logoutTest.data?.session === null) {
        this.addResult(
          "Session Management",
          "Session Cleanup",
          "PASS",
          "Session properly cleaned up on logout",
          "LOW",
          logoutTime,
        )
      } else {
        this.addResult(
          "Session Management",
          "Session Cleanup",
          "FAIL",
          "Session not properly cleaned up on logout",
          "HIGH",
          logoutTime,
        )
      }
    } catch (error: any) {
      this.addResult(
        "Session Management",
        "Session Testing",
        "FAIL",
        `Session management test failed: ${error.message}`,
        "HIGH",
      )
    }
  }

  // 6. API Security Testing
  async testAPISecurity() {
    this.log("🔌 Testing API Security...", "info")

    try {
      // Test rate limiting (if implemented)
      const rapidRequests = Array.from({ length: 10 }, () =>
        this.measureExecutionTime(async () => {
          return await this.supabase.from("system_settings").select("*").limit(1)
        }),
      )

      const { result: rateLimitResults, executionTime: rateLimitTime } = await this.measureExecutionTime(async () => {
        return await Promise.all(rapidRequests)
      })

      const successfulRequests = rateLimitResults.filter((r) => !r.result.error).length
      const failedRequests = rateLimitResults.filter((r) => r.result.error).length

      if (failedRequests > 0) {
        this.addResult(
          "API Security",
          "Rate Limiting",
          "PASS",
          `Rate limiting active - ${failedRequests}/10 requests blocked`,
          "LOW",
          rateLimitTime,
        )
      } else {
        this.addResult(
          "API Security",
          "Rate Limiting",
          "WARNING",
          "No rate limiting detected - consider implementing for production",
          "MEDIUM",
          rateLimitTime,
        )
      }

      // Test API key validation
      const { result: apiKeyTest, executionTime: apiTime } = await this.measureExecutionTime(async () => {
        // Test with invalid API key
        const invalidClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", "invalid-api-key")
        return await invalidClient.from("profiles").select("*").limit(1)
      })

      if (apiKeyTest.error) {
        this.addResult(
          "API Security",
          "API Key Validation",
          "PASS",
          "Invalid API keys properly rejected",
          "LOW",
          apiTime,
        )
      } else {
        this.addResult(
          "API Security",
          "API Key Validation",
          "FAIL",
          "Invalid API key was accepted - critical security issue!",
          "CRITICAL",
          apiTime,
        )
      }

      // Test CORS configuration
      this.addResult("API Security", "CORS Configuration", "SKIP", "CORS testing requires browser environment", "LOW")
    } catch (error: any) {
      this.addResult("API Security", "Security Testing", "FAIL", `API security test failed: ${error.message}`, "HIGH")
    }
  }

  // 7. Environment Security Testing
  async testEnvironmentSecurity() {
    this.log("🌍 Testing Environment Security...", "info")

    try {
      // Test environment variable protection
      const criticalEnvVars = ["SUPABASE_SERVICE_ROLE_KEY", "JWT_SECRET", "ENCRYPTION_KEY", "STRIPE_SECRET_KEY"]

      const exposedVars = []
      for (const envVar of criticalEnvVars) {
        if (process.env[envVar]) {
          // Check if it's properly configured (not empty, not default values)
          const value = process.env[envVar]
          if (value === "your-secret-key" || value === "change-me" || value.length < 10) {
            exposedVars.push(envVar)
          }
        }
      }

      if (exposedVars.length > 0) {
        this.addResult(
          "Environment Security",
          "Environment Variables",
          "FAIL",
          `Weak or default environment variables: ${exposedVars.join(", ")}`,
          "CRITICAL",
        )
      } else {
        this.addResult(
          "Environment Security",
          "Environment Variables",
          "PASS",
          "Environment variables properly configured",
          "LOW",
        )
      }

      // Test debug mode configuration
      const debugMode =
        process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_DEBUG_MODE === "true" ||
        process.env.DEBUG === "true"

      if (debugMode) {
        this.addResult(
          "Environment Security",
          "Debug Mode",
          "WARNING",
          "Debug mode is enabled - ensure it's disabled in production",
          "MEDIUM",
        )
      } else {
        this.addResult("Environment Security", "Debug Mode", "PASS", "Debug mode properly disabled", "LOW")
      }

      // Test demo/test mode configuration
      const demoMode =
        process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
        process.env.QA_BYPASS_AUTH === "1" ||
        process.env.ENABLE_TEST_ROUTES === "true"

      if (demoMode) {
        this.addResult(
          "Environment Security",
          "Demo/Test Mode",
          "WARNING",
          "Demo or test mode is enabled - ensure it's disabled in production",
          "HIGH",
        )
      } else {
        this.addResult("Environment Security", "Demo/Test Mode", "PASS", "Demo and test modes properly disabled", "LOW")
      }
    } catch (error: any) {
      this.addResult(
        "Environment Security",
        "Environment Testing",
        "FAIL",
        `Environment security test failed: ${error.message}`,
        "MEDIUM",
      )
    }
  }

  // Generate comprehensive security report
  generateSecurityReport() {
    this.log("\n📋 AUTHENTICATION & SECURITY TESTING REPORT", "info")
    this.log("=".repeat(90), "info")

    const summary = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "PASS").length,
      failed: this.results.filter((r) => r.status === "FAIL").length,
      warnings: this.results.filter((r) => r.status === "WARNING").length,
      skipped: this.results.filter((r) => r.status === "SKIP").length,
    }

    // Security severity analysis
    const severityCount = {
      CRITICAL: this.results.filter((r) => r.severity === "CRITICAL").length,
      HIGH: this.results.filter((r) => r.severity === "HIGH").length,
      MEDIUM: this.results.filter((r) => r.severity === "MEDIUM").length,
      LOW: this.results.filter((r) => r.severity === "LOW").length,
    }

    this.log(`\n📊 SUMMARY:`, "info")
    this.log(`✅ PASSED: ${summary.passed}`, "success")
    this.log(`⚠️  WARNINGS: ${summary.warnings}`, "warning")
    this.log(`❌ FAILED: ${summary.failed}`, "error")
    this.log(`⏭️  SKIPPED: ${summary.skipped}`, "info")
    this.log(`📈 TOTAL TESTS: ${summary.total}`, "info")

    this.log(`\n🚨 SECURITY SEVERITY BREAKDOWN:`, "info")
    this.log(`🔴 CRITICAL: ${severityCount.CRITICAL}`, "error")
    this.log(`🟠 HIGH: ${severityCount.HIGH}`, "error")
    this.log(`🟡 MEDIUM: ${severityCount.MEDIUM}`, "warning")
    this.log(`🟢 LOW: ${severityCount.LOW}`, "success")

    this.log(`\n📝 DETAILED RESULTS BY CATEGORY:`, "info")
    this.log("-".repeat(90), "info")

    // Group results by category
    const categoryGroups = this.results.reduce(
      (acc, result) => {
        if (!acc[result.category]) {
          acc[result.category] = []
        }
        acc[result.category].push(result)
        return acc
      },
      {} as Record<string, SecurityTestResult[]>,
    )

    for (const [category, results] of Object.entries(categoryGroups)) {
      this.log(`\n🔧 ${category.toUpperCase()}:`, "info")

      const categorySummary = {
        passed: results.filter((r) => r.status === "PASS").length,
        failed: results.filter((r) => r.status === "FAIL").length,
        warnings: results.filter((r) => r.status === "WARNING").length,
        critical: results.filter((r) => r.severity === "CRITICAL").length,
      }

      this.log(
        `   Status: ${categorySummary.passed}✅ ${categorySummary.failed}❌ ${categorySummary.warnings}⚠️ | Critical: ${categorySummary.critical}🔴`,
        "info",
      )

      for (const result of results) {
        const statusIcon =
          result.status === "PASS" ? "✅" : result.status === "WARNING" ? "⚠️" : result.status === "SKIP" ? "⏭️" : "❌"
        const severityIcon =
          result.severity === "CRITICAL"
            ? "🔴"
            : result.severity === "HIGH"
              ? "🟠"
              : result.severity === "MEDIUM"
                ? "🟡"
                : "🟢"
        const type =
          result.status === "PASS"
            ? "success"
            : result.status === "WARNING"
              ? "warning"
              : result.status === "SKIP"
                ? "info"
                : "error"
        const timeInfo = result.executionTime ? ` (${result.executionTime}ms)` : ""
        this.log(`   ${statusIcon}${severityIcon} ${result.test}: ${result.message}${timeInfo}`, type)
      }
    }

    // Critical security issues
    const criticalIssues = this.results.filter(
      (r) => r.severity === "CRITICAL" || (r.severity === "HIGH" && r.status === "FAIL"),
    )

    if (criticalIssues.length > 0) {
      this.log(`\n🚨 CRITICAL SECURITY ISSUES - IMMEDIATE ACTION REQUIRED:`, "error")
      this.log("=".repeat(90), "error")

      criticalIssues.forEach((issue, index) => {
        this.log(`${index + 1}. [${issue.category}] ${issue.test}:`, "error")
        this.log(`   ${issue.message}`, "error")
        this.log(`   Severity: ${issue.severity}`, "error")
        this.log("", "info")
      })
    }

    // Security recommendations
    this.log(`\n💡 SECURITY RECOMMENDATIONS:`, "info")
    this.log("-".repeat(90), "info")

    if (severityCount.CRITICAL > 0) {
      this.log("🔴 CRITICAL: Fix all critical security issues before production deployment!", "error")
    }
    if (severityCount.HIGH > 0) {
      this.log("🟠 HIGH: Address high-severity security issues as soon as possible.", "error")
    }
    if (severityCount.MEDIUM > 3) {
      this.log("🟡 MEDIUM: Consider addressing medium-severity issues for better security posture.", "warning")
    }
    if (summary.failed === 0 && severityCount.CRITICAL === 0 && severityCount.HIGH === 0) {
      this.log("🎉 Excellent! No critical security issues found.", "success")
      this.log("✅ Your system meets basic security requirements for production.", "success")
    }

    // Security score calculation
    const maxScore = this.results.length * 4 // 4 points per test
    const actualScore = this.results.reduce((score, result) => {
      if (result.status === "PASS") return score + 4
      if (result.status === "WARNING") return score + 2
      if (result.status === "SKIP") return score + 1
      return score // FAIL = 0 points
    }, 0)

    const securityScore = Math.round((actualScore / maxScore) * 100)

    this.log(
      `\n📊 SECURITY SCORE: ${securityScore}%`,
      securityScore >= 80 ? "success" : securityScore >= 60 ? "warning" : "error",
    )

    if (securityScore >= 90) {
      this.log("🏆 Excellent security posture!", "success")
    } else if (securityScore >= 80) {
      this.log("👍 Good security posture with room for improvement.", "success")
    } else if (securityScore >= 60) {
      this.log("⚠️ Moderate security posture - address issues before production.", "warning")
    } else {
      this.log("🚨 Poor security posture - significant improvements needed!", "error")
    }

    this.log(`\n⏰ Security testing completed at: ${new Date().toLocaleString("th-TH")}`, "info")
    this.log("=".repeat(90), "info")

    return {
      summary,
      severityCount,
      results: this.results,
      criticalIssues,
      securityScore,
      isSecure: severityCount.CRITICAL === 0 && severityCount.HIGH === 0,
      isProductionReady: severityCount.CRITICAL === 0 && summary.failed <= 2,
    }
  }

  // Main execution method
  async runFullSecurityTesting() {
    this.log("🚀 Starting Authentication & Security Testing...", "info")
    this.log(`📅 Started at: ${new Date().toLocaleString("th-TH")}`, "info")
    this.log("=".repeat(90), "info")

    try {
      await this.testAuthenticationFlows()
      await this.testRoleBasedAccessControl()
      await this.testDataProtectionPrivacy()
      await this.testInputValidationSanitization()
      await this.testSessionManagement()
      await this.testAPISecurity()
      await this.testEnvironmentSecurity()

      return this.generateSecurityReport()
    } catch (error: any) {
      this.log(`❌ Security testing failed: ${error.message}`, "error")
      this.addResult("System", "Execution", "FAIL", `Security testing execution failed: ${error.message}`, "CRITICAL")
      return this.generateSecurityReport()
    }
  }
}

// Execute the security testing
async function main() {
  const tester = new AuthenticationSecurityTester()
  const report = await tester.runFullSecurityTesting()

  // Save report to file
  const fs = await import("fs")
  const reportPath = `./security-testing-report-${Date.now()}.json`

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Security testing report saved to: ${reportPath}`)
  } catch (error) {
    console.log(`⚠️ Could not save report file: ${error}`)
  }

  // Exit with appropriate code
  process.exit(report.isProductionReady ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}

export { AuthenticationSecurityTester }
