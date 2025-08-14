import { type NextRequest, NextResponse } from "next/server"
import { securityService } from "@/lib/security-service"
import { createClient } from "@/lib/supabase/server"
import { USE_SUPABASE } from "@/lib/runtime"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Validate input
    const validation = securityService.validateAndSanitizeInput(email, "email")
    if (!validation.isValid) {
      return NextResponse.json({ error: "Invalid email format", details: validation.errors }, { status: 400 })
    }

    // Check rate limiting
    const rateLimit = await securityService.checkRateLimit(`reset_password:${clientIP}`, {
      window_ms: 300000, // 5 minutes
      max_requests: 3, // Max 3 reset attempts per 5 minutes
      block_duration_ms: 900000, // 15 minutes block
    })

    if (!rateLimit.allowed) {
      await securityService.logSecurityEvent({
        id: `rate_limit_reset_${Date.now()}`,
        type: "rate_limit_exceeded",
        severity: "medium",
        ip_address: clientIP,
        user_agent: request.headers.get("user-agent") || "",
        details: { email, action: "password_reset" },
        timestamp: new Date().toISOString(),
        blocked: true,
      })

      return NextResponse.json({ error: "Too many reset attempts. Please try again later." }, { status: 429 })
    }

    if (USE_SUPABASE) {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(validation.sanitized, {
        redirectTo: `${request.nextUrl.origin}/auth/reset-password`,
      })

      if (error) {
        await securityService.logSecurityEvent({
          id: `reset_error_${Date.now()}`,
          type: "login_attempt",
          severity: "low",
          ip_address: clientIP,
          user_agent: request.headers.get("user-agent") || "",
          details: { email: validation.sanitized, error: error.message },
          timestamp: new Date().toISOString(),
          blocked: false,
        })

        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    // Log successful reset request
    await securityService.logSecurityEvent({
      id: `reset_success_${Date.now()}`,
      type: "login_attempt",
      severity: "low",
      ip_address: clientIP,
      user_agent: request.headers.get("user-agent") || "",
      details: { email: validation.sanitized, action: "password_reset_requested" },
      timestamp: new Date().toISOString(),
      blocked: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
