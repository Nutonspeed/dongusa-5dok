// Critical Issue #6: Missing Security Middleware
// Impact: No protection against common attacks
// Solution: Comprehensive security middleware

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SecurityHeaders } from "@/lib/critical-fixes"

// IP-based rate limiting
const ipRateLimiter = new Map<string, { count: number; resetTime: number }>()

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

function isRateLimited(ip: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const record = ipRateLimiter.get(ip)

  if (!record || now > record.resetTime) {
    ipRateLimiter.set(ip, { count: 1, resetTime: now + windowMs })
    return false
  }

  if (record.count >= limit) {
    return true
  }

  record.count++
  return false
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const ip = getClientIP(request)
  const pathname = request.nextUrl.pathname

  // Apply security headers
  Object.entries(SecurityHeaders.headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Set CSP header
  response.headers.set("Content-Security-Policy", SecurityHeaders.CSP)

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    if (isRateLimited(ip, 100, 60000)) {
      return new NextResponse("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": "0",
        },
      })
    }

    // Stricter rate limiting for sensitive endpoints
    if (pathname.includes("/notify-payment") || pathname.includes("/customers")) {
      if (isRateLimited(`${ip}-sensitive`, 10, 60000)) {
        return new NextResponse("Rate limit exceeded for sensitive operation", {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
          },
        })
      }
    }
  }

  // Block suspicious requests
  const userAgent = request.headers.get("user-agent") || ""
  const suspiciousPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i]

  // Allow legitimate bots but block malicious ones
  const isLegitimateBot = /googlebot|bingbot|slurp|duckduckbot/i.test(userAgent)
  const isSuspicious = suspiciousPatterns.some((pattern) => pattern.test(userAgent)) && !isLegitimateBot

  if (isSuspicious && pathname.startsWith("/api/")) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Add request ID for tracing
  const requestId = crypto.randomUUID()
  response.headers.set("X-Request-ID", requestId)

  // Log suspicious activity
  if (pathname.includes("admin") && !request.headers.get("authorization")) {
    console.warn(`Unauthorized admin access attempt from ${ip}`, {
      pathname,
      userAgent,
      requestId,
    })
  }

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
