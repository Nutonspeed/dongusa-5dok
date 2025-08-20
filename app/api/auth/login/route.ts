export const runtime = "nodejs"

import { bruteForceProtection } from "@/lib/brute-force-protection"
import { USE_SUPABASE } from "@/lib/runtime"
import { securityService } from "@/lib/security-service"
import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/auth/login
 * MVP: ใช้ Supabase จริงเมื่อ USE_SUPABASE=true และ fallback เป็น mock เมื่อยังไม่ได้ตั้งค่า
 * - ป้องกัน brute force + CAPTCHA
 * - ตั้งค่า session ผ่าน Supabase SSR cookie ใน response
 * - คืนค่า role ของผู้ใช้เพื่อ client จะ redirect ตามสิทธิ์
 */
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

    // Check brute force protection (pre-attempt)
    const bruteForceCheck = await bruteForceProtection.checkLoginAttempt(
      emailValidation.sanitized,
      clientIP,
      userAgent,
      false,
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

    // Real authentication with Supabase (MVP)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (USE_SUPABASE && supabaseUrl && supabaseAnon) {
      // Collect cookies set by Supabase to attach to our JSON response
      const cookiesToSet: Array<{ name: string; value: string; options?: any }> = []
      const supabase = createServerClient(supabaseUrl, supabaseAnon, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(items) {
            items.forEach((c) => cookiesToSet.push(c))
          },
        },
      })

      // Perform sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValidation.sanitized,
        password,
      })

      // Log final attempt result
      await bruteForceProtection.checkLoginAttempt(
        emailValidation.sanitized,
        clientIP,
        userAgent,
        !error && !!data?.user,
      )

      if (error || !data?.user) {
        return NextResponse.json(
          {
            error: error?.message || "Invalid credentials",
            requiresCaptcha: bruteForceCheck.requiresCaptcha,
            remainingAttempts: Math.max((bruteForceCheck.remainingAttempts ?? 1) - 1, 0),
          },
          { status: 401 },
        )
      }

      // Fetch role from profiles
      let role: string | null = null
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()
        role = (profile as any)?.role ?? null
      } catch {
        // Ignore profile fetch error, role stays null
      }

      // Build response and attach cookies set by Supabase
      const res = NextResponse.json({
        success: true,
        userId: data.user.id,
        email: data.user.email,
        role,
      })
      cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
      return res
    }

    // Fallback: mock authentication (when Supabase not configured)
    const isValidCredentials = await simulateAuthentication(emailValidation.sanitized, password)

    // Log the attempt result
    const finalResult = await bruteForceProtection.checkLoginAttempt(
      emailValidation.sanitized,
      clientIP,
      userAgent,
      isValidCredentials,
    )

    if (isValidCredentials) {
      return NextResponse.json({ success: true, message: "Login successful (mock)" })
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
  // This is a mock authentication function (kept for non-Supabase env)
  const validCredentials = [
    { email: "user@sofacover.com", password: "user123" },
    { email: "admin@sofacover.com", password: "admin123" },
  ]

  return validCredentials.some((cred) => cred.email === email && cred.password === password)
}
