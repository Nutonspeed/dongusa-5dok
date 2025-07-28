// Simplified security middleware to prevent browser lockup
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

function isRateLimited(ip: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now()
  const key = `${ip}-${Math.floor(now / windowMs)}`

  const current = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs }

  if (current.count >= limit) {
    return true
  }

  current.count++
  rateLimitMap.set(key, current)

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance
    const cutoff = now - windowMs * 2
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < cutoff) {
        rateLimitMap.delete(k)
      }
    }
  }

  return false
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const ip = getClientIP(request)
  const pathname = request.nextUrl.pathname

  // Basic security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Simple CSP for development
  if (process.env.NODE_ENV === "development") {
    response.headers.set(
      "Content-Security-Policy-Report-Only",
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss: http: https:;",
    )
  }

  // Rate limiting for API routes only
  if (pathname.startsWith("/api/")) {
    if (isRateLimited(ip, 100, 60000)) {
      return new NextResponse("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      })
    }

    // Stricter rate limiting for sensitive endpoints
    if (pathname.includes("/admin") || pathname.includes("/auth")) {
      if (isRateLimited(`${ip}-sensitive`, 20, 60000)) {
        return new NextResponse("Rate limit exceeded", {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        })
      }
    }
  }

  // Add request ID for tracing
  response.headers.set("X-Request-ID", crypto.randomUUID())

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
