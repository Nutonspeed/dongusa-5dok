export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { bruteForceProtection } from "@/lib/brute-force-protection"
import { securityService } from "@/lib/security-service"

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

    // Here you would perform the actual authentication
    // For this example, we'll simulate it
    const isValidCredentials = await simulateAuthentication(emailValidation.sanitized, password)

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

async function simulateAuthentication(email: string, password: string): Promise<boolean> {
  // This is a mock authentication function
  // In a real application, you would verify against your database
  const validCredentials = [
    { email: "user@sofacover.com", password: "user123" },
    { email: "admin@sofacover.com", password: "admin123" },
  ]

  return validCredentials.some((cred) => cred.email === email && cred.password === password)
}
