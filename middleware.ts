import { logger } from "@/lib/logger"
import { QA_BYPASS_AUTH, USE_SUPABASE, IS_PRODUCTION } from "@/lib/runtime"
import { NextResponse, type NextRequest } from "next/server"

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) return forwarded.split(",")[0].trim()
  if (realIP) return realIP
  return "unknown"
}

function isRateLimited(ip: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now()
  const key = `${ip}-${Math.floor(now / windowMs)}`

  const current = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs }

  if (current.count >= limit) return true

  current.count++
  rateLimitMap.set(key, current)

  // Cleanup old entries
  if (Math.random() < 0.01) {
    const cutoff = now - windowMs * 2
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < cutoff) rateLimitMap.delete(k)
    }
  }

  return false
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const ip = getClientIP(request)
  const pathname = request.nextUrl.pathname

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Strict CSP in production
  if (IS_PRODUCTION) {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
    )
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    if (isRateLimited(ip, 100, 60000)) {
      logger.warn(`Rate limit exceeded for IP: ${ip}`)
      return new NextResponse("Rate limit exceeded", {
        status: 429,
        headers: { "Retry-After": "60" },
      })
    }

    // Stricter rate limiting for auth endpoints
    if (pathname.includes("/auth") || pathname.includes("/admin")) {
      if (isRateLimited(`${ip}-auth`, 20, 60000)) {
        logger.warn(`Auth rate limit exceeded for IP: ${ip}`)
        return new NextResponse("Rate limit exceeded", {
          status: 429,
          headers: { "Retry-After": "60" },
        })
      }
    }
  }

  // Authentication middleware
  if (USE_SUPABASE && !QA_BYPASS_AUTH) {
    try {
      const { updateSession } = await import("@/lib/supabase/middleware")
      return await updateSession(request)
    } catch (error) {
      logger.error("Supabase middleware error:", error)

      // Fallback to mock auth in development
      if (!IS_PRODUCTION) {
        logger.warn("Falling back to mock authentication")
        return response
      }

      // In production, return error
      return new NextResponse("Authentication service unavailable", {
        status: 503,
      })
    }
  }

  // QA Bypass warning
  if (QA_BYPASS_AUTH) {
    response.headers.set("X-QA-Bypass", "true")
    logger.warn(`QA bypass active for ${pathname}`)
  }

  // Request ID for tracing
  response.headers.set("X-Request-ID", crypto.randomUUID())

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
