import { type NextRequest, NextResponse } from "next/server"
import { bruteForceProtection } from "@/lib/brute-force-protection"
import { securityService } from "@/lib/security-service"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, captchaToken } = await request.json()
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || ""

    // Validate input
    const emailValidation = securityService.validateAndSanitizeInput(email, "email")
    const passwordValidation = securityService.validateAndSanitizeInput(password, "password")

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: [...emailValidation.errors, ...passwordValidation.errors],
        },
        { status: 400 },
      )
    }

    // Check for security threats
    if (emailValidation.securityThreats.length > 0 || passwordValidation.securityThreats.length > 0) {
      await securityService.logSecurityEvent({
        id: `security_threat_${Date.now()}`,
        type: "suspicious_activity",
        severity: "high",
        ip_address: clientIP,
        user_agent: userAgent,
        details: {
          threats: [...emailValidation.securityThreats, ...passwordValidation.securityThreats],
          email: emailValidation.sanitized,
        },
        timestamp: new Date().toISOString(),
        blocked: true,
      })

      return NextResponse.json({ error: "Security violation detected" }, { status: 403 })
    }

    // Check brute force protection
    const bruteForceCheck = await bruteForceProtection.checkLoginAttempt(
      emailValidation.sanitized,
      clientIP,
      userAgent,
      false, // We haven't attempted login yet
    )

    if (!bruteForceCheck.allowed) {
      return NextResponse.json(
        {
          error: bruteForceCheck.message,
          lockoutUntil: bruteForceCheck.lockoutUntil,
          requiresCaptcha: bruteForceCheck.requiresCaptcha,
          remainingAttempts: bruteForceCheck.remainingAttempts,
        },
        { status: 429 },
      )
    }

    // Verify CAPTCHA if required
    if (bruteForceCheck.requiresCaptcha && !captchaToken) {
      return NextResponse.json(
        {
          error: "CAPTCHA verification required",
          requiresCaptcha: true,
          remainingAttempts: bruteForceCheck.remainingAttempts,
        },
        { status: 400 },
      )
    }

    // Perform authentication against Supabase
    const supabase = createClient()
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email: emailValidation.sanitized,
      password, // Supabase stores and verifies hashed passwords
    })

    if (authError && authError.status !== 400) {
      console.error("Authentication service error:", authError)
      // Record failed attempt due to service error
      await bruteForceProtection.checkLoginAttempt(
        emailValidation.sanitized,
        clientIP,
        userAgent,
        false,
      )
      return NextResponse.json(
        { error: "Authentication service error" },
        { status: 500 },
      )
    }

    const isValidCredentials = !!authData?.user && !authError

    // Log the attempt result
    const finalResult = await bruteForceProtection.checkLoginAttempt(
      emailValidation.sanitized,
      clientIP,
      userAgent,
      isValidCredentials,
    )

    if (isValidCredentials) {
      return NextResponse.json({ success: true, message: "Login successful" })
    } else {
      return NextResponse.json(
        {
          error: finalResult.message,
          requiresCaptcha: finalResult.requiresCaptcha,
          remainingAttempts: finalResult.remainingAttempts,
          lockoutUntil: finalResult.lockoutUntil,
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
