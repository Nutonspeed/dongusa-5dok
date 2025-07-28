"use client"

// Critical Issue #1: Missing Error Boundary Implementation
// Impact: Application crashes propagate to entire UI
// Solution: Implement comprehensive error boundaries

import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    // Report to error tracking service
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail if error reporting fails
      })
    }

    this.props.onError?.(error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">A component error occurred. Please try refreshing the page.</p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-mono">{this.state.error.message}</p>
              </div>
            )}
            <Button onClick={() => this.setState({ hasError: false, error: undefined })} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Critical Issue #2: Missing Input Validation and Sanitization
// Impact: XSS vulnerabilities and data corruption
// Solution: Comprehensive validation utilities

export const ValidationUtils = {
  // Email validation with comprehensive regex
  isValidEmail: (email: string): boolean => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(email) && email.length <= 254
  },

  // Phone validation supporting international formats
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    const cleanPhone = phone.replace(/[\s\-$$$$]/g, "")
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10 && cleanPhone.length <= 15
  },

  // Sanitize HTML to prevent XSS
  sanitizeHtml: (input: string): string => {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
  },

  // Validate and sanitize text input
  sanitizeText: (input: string, maxLength = 1000): string => {
    if (typeof input !== "string") return ""
    return input.trim().slice(0, maxLength)
  },

  // Validate numeric input
  isValidNumber: (value: any, min?: number, max?: number): boolean => {
    const num = Number(value)
    if (isNaN(num) || !isFinite(num)) return false
    if (min !== undefined && num < min) return false
    if (max !== undefined && num > max) return false
    return true
  },

  // Validate postal code for multiple countries
  isValidPostalCode: (code: string, country = "US"): boolean => {
    const patterns: Record<string, RegExp> = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
      UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/,
      TH: /^\d{5}$/,
      // Add more countries as needed
    }

    const pattern = patterns[country.toUpperCase()] || /^[A-Za-z0-9\s-]{3,20}$/
    return pattern.test(code.trim())
  },
}

// Critical Issue #3: Missing Rate Limiting Implementation
// Impact: API abuse and DoS vulnerabilities
// Solution: Token bucket rate limiter

interface RateLimitConfig {
  maxTokens: number
  refillRate: number // tokens per second
  windowMs: number
}

export class RateLimiter {
  private buckets = new Map<string, { tokens: number; lastRefill: number }>()

  constructor(private config: RateLimitConfig) {}

  isAllowed(key: string): boolean {
    const now = Date.now()
    const bucket = this.buckets.get(key) || { tokens: this.config.maxTokens, lastRefill: now }

    // Calculate tokens to add based on time elapsed
    const timePassed = (now - bucket.lastRefill) / 1000
    const tokensToAdd = Math.floor(timePassed * this.config.refillRate)

    bucket.tokens = Math.min(this.config.maxTokens, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now

    if (bucket.tokens > 0) {
      bucket.tokens--
      this.buckets.set(key, bucket)
      return true
    }

    this.buckets.set(key, bucket)
    return false
  }

  getRemainingTokens(key: string): number {
    const bucket = this.buckets.get(key)
    return bucket ? bucket.tokens : this.config.maxTokens
  }

  reset(key: string): void {
    this.buckets.delete(key)
  }

  // Cleanup old buckets to prevent memory leaks
  cleanup(): void {
    const now = Date.now()
    const cutoff = now - this.config.windowMs

    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.lastRefill < cutoff) {
        this.buckets.delete(key)
      }
    }
  }
}

// Global rate limiters for different operations
export const rateLimiters = {
  addressUpdate: new RateLimiter({ maxTokens: 5, refillRate: 1 / 60, windowMs: 300000 }), // 5 updates per 5 minutes
  paymentNotification: new RateLimiter({ maxTokens: 3, refillRate: 1 / 300, windowMs: 900000 }), // 3 notifications per 15 minutes
  apiGeneral: new RateLimiter({ maxTokens: 100, refillRate: 1, windowMs: 60000 }), // 100 requests per minute
}

// Critical Issue #4: Missing Security Headers and CSRF Protection
// Impact: Various security vulnerabilities
// Solution: Security middleware and headers

export const SecurityHeaders = {
  // Content Security Policy
  CSP: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",

  // Security headers object
  headers: {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  },
}

// CSRF Token generation and validation
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>()

  static generateToken(sessionId: string): string {
    const token = crypto.randomUUID()
    const expires = Date.now() + 3600000 // 1 hour

    this.tokens.set(sessionId, { token, expires })
    return token
  }

  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId)
    if (!stored) return false

    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId)
      return false
    }

    return stored.token === token
  }

  static cleanup(): void {
    const now = Date.now()
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(sessionId)
      }
    }
  }
}
