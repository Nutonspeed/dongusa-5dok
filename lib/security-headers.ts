import type { NextRequest, NextResponse } from "next/server"

export class SecurityHeadersService {
  private static instance: SecurityHeadersService

  static getInstance(): SecurityHeadersService {
    if (!SecurityHeadersService.instance) {
      SecurityHeadersService.instance = new SecurityHeadersService()
    }
    return SecurityHeadersService.instance
  }

  // Apply security headers to response
  applySecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
    const headers = this.getSecurityHeaders(request)

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  // Get security headers based on request context
  private getSecurityHeaders(request: NextRequest): Record<string, string> {
    const isAPI = request.nextUrl.pathname.startsWith("/api")
    const isAuth = request.nextUrl.pathname.startsWith("/auth")
    const isAdmin = request.nextUrl.pathname.startsWith("/admin")

    const baseHeaders = {
      "X-DNS-Prefetch-Control": "on",
      "X-XSS-Protection": "1; mode=block",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Powered-By": "", // Remove server fingerprinting
    }

    // API specific headers
    if (isAPI) {
      return {
        ...baseHeaders,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Robots-Tag": "noindex, nofollow",
      }
    }

    // Auth pages specific headers
    if (isAuth) {
      return {
        ...baseHeaders,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Frame-Options": "DENY",
        "Content-Security-Policy": this.getStrictCSP(),
      }
    }

    // Admin pages specific headers
    if (isAdmin) {
      return {
        ...baseHeaders,
        "X-Frame-Options": "DENY",
        "X-Robots-Tag": "noindex, nofollow",
        "Content-Security-Policy": this.getAdminCSP(),
      }
    }

    return baseHeaders
  }

  // Strict CSP for auth pages
  private getStrictCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  }

  // Admin CSP with additional restrictions
  private getAdminCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  }

  // Validate security headers
  validateHeaders(headers: Headers): {
    isSecure: boolean
    missing: string[]
    recommendations: string[]
  } {
    const requiredHeaders = ["X-Frame-Options", "X-Content-Type-Options", "X-XSS-Protection", "Referrer-Policy"]

    const recommendedHeaders = ["Strict-Transport-Security", "Content-Security-Policy", "Permissions-Policy"]

    const missing: string[] = []
    const recommendations: string[] = []

    requiredHeaders.forEach((header) => {
      if (!headers.get(header)) {
        missing.push(header)
      }
    })

    recommendedHeaders.forEach((header) => {
      if (!headers.get(header)) {
        recommendations.push(header)
      }
    })

    return {
      isSecure: missing.length === 0,
      missing,
      recommendations,
    }
  }

  // Security headers audit
  auditSecurityHeaders(url: string): Promise<{
    score: number
    headers: Record<string, string>
    issues: string[]
    recommendations: string[]
  }> {
    return fetch(url, { method: "HEAD" })
      .then((response) => {
        const headers: Record<string, string> = {}
        const issues: string[] = []
        const recommendations: string[] = []
        let score = 100

        // Extract headers
        response.headers.forEach((value, key) => {
          headers[key.toLowerCase()] = value
        })

        // Check critical headers
        if (!headers["x-frame-options"]) {
          issues.push("Missing X-Frame-Options header - vulnerable to clickjacking")
          score -= 15
        }

        if (!headers["x-content-type-options"]) {
          issues.push("Missing X-Content-Type-Options header - vulnerable to MIME sniffing")
          score -= 10
        }

        if (!headers["content-security-policy"]) {
          recommendations.push("Add Content-Security-Policy header for XSS protection")
          score -= 20
        }

        if (!headers["strict-transport-security"]) {
          recommendations.push("Add HSTS header for HTTPS enforcement")
          score -= 15
        }

        return { score: Math.max(0, score), headers, issues, recommendations }
      })
      .catch(() => ({
        score: 0,
        headers: {},
        issues: ["Failed to fetch headers"],
        recommendations: ["Ensure server is accessible"],
      }))
  }
}

export const securityHeaders = SecurityHeadersService.getInstance()
