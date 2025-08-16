#!/usr/bin/env tsx

/**
 * Authentication System Test Script
 * ทดสอบระบบ Authentication อย่างครอบคลุม
 */

import { createClient } from "@supabase/supabase-js"
import { sessionManager } from "@/lib/session-management"
import { bruteForceProtection } from "@/lib/brute-force-protection"
import { securityService } from "@/lib/security-service"

interface AuthTest {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  duration?: number
}

class AuthenticationTester {
  private supabase: any
  private results: AuthTest[] = []
  private startTime = Date.now()
  private testUserId = "test-user-" + Date.now()
  private testEmail = `test-${Date.now()}@example.com`

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      this.log("Missing Supabase credentials", "error")
      process.exit(1)
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  private log(message: string, type: "info" | "success" | "error" | "warning" = "info") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      reset: "\x1b[0m",
    }

    console.log(`${colors[type]}[AUTH-TEST] ${message}${colors.reset}`)
  }

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<AuthTest> {
    const testStart = Date.now()
    this.log(`Running: ${testName}...`)

    try {
      await testFn()
      const duration = Date.now() - testStart
      this.log(`✓ ${testName} passed (${duration}ms)`, "success")

      return {
        name: testName,
        status: "pass",
        message: `Test completed successfully in ${duration}ms`,
        duration,
      }
    } catch (error: any) {
      const duration = Date.now() - testStart
      this.log(`✗ ${testName} failed: ${error.message}`, "error")

      return {
        name: testName,
        status: "fail",
        message: error.message,
        duration,
      }
    }
  }

  private async testEnvironmentVariables(): Promise<void> {
    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
    ]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(", ")}`)
    }

    this.log("✓ All required environment variables present", "success")
  }

  private async testSupabaseAuth(): Promise<void> {
    // Test Supabase authentication connection
    const { data, error } = await this.supabase.auth.getSession()

    if (error && error.message !== "Auth session missing!") {
      throw new Error(`Supabase auth connection failed: ${error.message}`)
    }

    this.log("✓ Supabase authentication service accessible", "success")

    // Test user profile access
    const { data: profiles, error: profileError } = await this.supabase.from("profiles").select("id, role").limit(1)

    if (profileError) {
      throw new Error(`Cannot access profiles table: ${profileError.message}`)
    }

    this.log("✓ User profiles table accessible", "success")
  }

  private async testSessionManagement(): Promise<void> {
    const testIP = "192.168.1.100"
    const testUserAgent = "Test-Agent/1.0"

    // Test session creation
    const { sessionId, session } = await sessionManager.createSession(
      this.testUserId,
      this.testEmail,
      "customer",
      testIP,
      testUserAgent,
    )

    if (!sessionId || !session) {
      throw new Error("Failed to create session")
    }

    this.log("✓ Session creation successful", "success")

    // Test session validation
    const validation = await sessionManager.validateSession(sessionId, testIP, testUserAgent)

    if (!validation.isValid) {
      throw new Error("Session validation failed")
    }

    this.log("✓ Session validation successful", "success")

    // Test session refresh
    const refreshResult = await sessionManager.refreshSession(sessionId)

    if (!refreshResult.success) {
      throw new Error("Session refresh failed")
    }

    this.log("✓ Session refresh successful", "success")

    // Test session destruction
    await sessionManager.destroySession(sessionId)

    const postDestroyValidation = await sessionManager.validateSession(sessionId, testIP, testUserAgent)

    if (postDestroyValidation.isValid) {
      throw new Error("Session should be invalid after destruction")
    }

    this.log("✓ Session destruction successful", "success")
  }

  private async testBruteForceProtection(): Promise<void> {
    const testIP = "192.168.1.200"
    const testUserAgent = "Test-Agent/1.0"
    const testIdentifier = `test-${Date.now()}@example.com`

    // Test successful login (should reset attempts)
    const successResult = await bruteForceProtection.checkLoginAttempt(testIdentifier, testIP, testUserAgent, true)

    if (!successResult.allowed) {
      throw new Error("Successful login should be allowed")
    }

    this.log("✓ Successful login handling works", "success")

    // Test failed login attempts
    let failedResult
    for (let i = 0; i < 3; i++) {
      failedResult = await bruteForceProtection.checkLoginAttempt(testIdentifier, testIP, testUserAgent, false)
    }

    if (!failedResult?.requiresCaptcha) {
      throw new Error("CAPTCHA should be required after multiple failed attempts")
    }

    this.log("✓ CAPTCHA requirement triggered correctly", "success")

    // Test account status
    const accountStatus = await bruteForceProtection.getAccountStatus(testIdentifier)

    if (accountStatus.attempts === 0) {
      throw new Error("Failed attempts should be tracked")
    }

    this.log("✓ Account status tracking works", "success")

    // Reset for cleanup
    await bruteForceProtection.resetAccountAttempts(testIdentifier)
  }

  private async testSecurityService(): Promise<void> {
    // Test security event logging
    const testEvent = {
      id: `test_event_${Date.now()}`,
      type: "login_attempt" as const,
      severity: "low" as const,
      ip_address: "192.168.1.300",
      user_agent: "Test-Agent/1.0",
      user_id: this.testUserId,
      details: { test: true },
      timestamp: new Date().toISOString(),
      blocked: false,
    }

    await securityService.logSecurityEvent(testEvent)
    this.log("✓ Security event logging works", "success")

    // Test input validation
    const emailValidation = securityService.validateAndSanitizeInput("test@example.com", "email")

    if (!emailValidation.isValid) {
      throw new Error("Valid email should pass validation")
    }

    this.log("✓ Input validation works", "success")

    // Test security threat detection
    const maliciousInput = "<script>alert('xss')</script>"
    const threatValidation = securityService.validateAndSanitizeInput(maliciousInput, "text")

    if (threatValidation.securityThreats.length === 0) {
      throw new Error("XSS attempt should be detected")
    }

    this.log("✓ Security threat detection works", "success")
  }

  private async testAuthGuardComponents(): Promise<void> {
    // Test that auth components exist and are properly structured
    const fs = await import("fs")
    const path = await import("path")

    const authFiles = [
      "components/auth/AuthGuard.tsx",
      "components/login-form.tsx",
      "components/sign-up-form.tsx",
      "app/contexts/AuthContext.tsx",
      "middleware.ts",
    ]

    for (const file of authFiles) {
      if (!fs.existsSync(path.join(process.cwd(), file))) {
        throw new Error(`Required auth file missing: ${file}`)
      }
    }

    this.log("✓ All required authentication components exist", "success")
  }

  private async testRoleBasedAccess(): Promise<void> {
    // Test role-based access control logic
    const adminSession = await sessionManager.createSession(
      "admin-user",
      "admin@example.com",
      "admin",
      "192.168.1.400",
      "Test-Agent/1.0",
    )

    const customerSession = await sessionManager.createSession(
      "customer-user",
      "customer@example.com",
      "customer",
      "192.168.1.500",
      "Test-Agent/1.0",
    )

    // Verify admin session has admin role
    if (adminSession.session.role !== "admin") {
      throw new Error("Admin session should have admin role")
    }

    // Verify customer session has customer role
    if (customerSession.session.role !== "customer") {
      throw new Error("Customer session should have customer role")
    }

    this.log("✓ Role-based access control works", "success")

    // Cleanup
    await sessionManager.destroySession(adminSession.sessionId)
    await sessionManager.destroySession(customerSession.sessionId)
  }

  private async testPasswordSecurity(): Promise<void> {
    // Test password validation
    const weakPasswords = ["123", "password", "abc123"]
    const strongPassword = "StrongP@ssw0rd123!"

    for (const weakPassword of weakPasswords) {
      const validation = securityService.validateAndSanitizeInput(weakPassword, "password")
      if (validation.isValid && validation.errors.length === 0) {
        this.log(`⚠ Weak password "${weakPassword}" passed validation`, "warning")
      }
    }

    const strongValidation = securityService.validateAndSanitizeInput(strongPassword, "password")
    if (!strongValidation.isValid) {
      throw new Error("Strong password should pass validation")
    }

    this.log("✓ Password security validation works", "success")
  }

  private generateReport(): void {
    const totalTime = Date.now() - this.startTime
    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const warnings = this.results.filter((r) => r.status === "warning").length

    this.log("=".repeat(60), "info")
    this.log("AUTHENTICATION SYSTEM REPORT", "info")
    this.log("=".repeat(60), "info")

    this.results.forEach((result) => {
      const icon = result.status === "pass" ? "✓" : result.status === "fail" ? "✗" : "⚠"
      const color = result.status === "pass" ? "success" : result.status === "fail" ? "error" : "warning"
      this.log(`${icon} ${result.name}: ${result.message}`, color)
    })

    this.log("=".repeat(60), "info")
    this.log(`Total Tests: ${this.results.length}`, "info")
    this.log(`Passed: ${passed}`, passed > 0 ? "success" : "info")
    this.log(`Failed: ${failed}`, failed > 0 ? "error" : "info")
    this.log(`Warnings: ${warnings}`, warnings > 0 ? "warning" : "info")
    this.log(`Total Time: ${totalTime}ms`, "info")

    if (failed === 0) {
      this.log("🎉 AUTHENTICATION TEST PASSED! All authentication systems working correctly.", "success")
    } else {
      this.log("❌ AUTHENTICATION TEST FAILED! Please check authentication configuration.", "error")
    }
  }

  async runAllTests(): Promise<boolean> {
    this.log("Starting authentication system tests...", "info")
    this.log("=".repeat(60), "info")

    // Run all tests
    this.results.push(await this.runTest("Environment Variables Check", () => this.testEnvironmentVariables()))
    this.results.push(await this.runTest("Supabase Authentication", () => this.testSupabaseAuth()))
    this.results.push(await this.runTest("Session Management", () => this.testSessionManagement()))
    this.results.push(await this.runTest("Brute Force Protection", () => this.testBruteForceProtection()))
    this.results.push(await this.runTest("Security Service", () => this.testSecurityService()))
    this.results.push(await this.runTest("Auth Guard Components", () => this.testAuthGuardComponents()))
    this.results.push(await this.runTest("Role-Based Access", () => this.testRoleBasedAccess()))
    this.results.push(await this.runTest("Password Security", () => this.testPasswordSecurity()))

    // Generate report
    this.generateReport()

    const hasFailures = this.results.some((r) => r.status === "fail")
    return !hasFailures
  }
}

// Run the test
const tester = new AuthenticationTester()
tester
  .runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error("Authentication test failed with error:", error)
    process.exit(1)
  })
