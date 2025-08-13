import { randomBytes, scrypt } from "crypto"
import { promisify } from "util"
import { createClient } from "@supabase/supabase-js"
import { Redis } from "@upstash/redis"

const scryptAsync = promisify(scrypt)

interface SecurityEvent {
  id: string
  type: "login_attempt" | "suspicious_activity" | "rate_limit_exceeded" | "sql_injection" | "xss_attempt"
  severity: "low" | "medium" | "high" | "critical"
  ip_address: string
  user_agent: string
  user_id?: string
  details: Record<string, any>
  timestamp: string
  blocked: boolean
}

interface RateLimitConfig {
  window_ms: number
  max_requests: number
  block_duration_ms: number
}

interface SecurityScanResult {
  scan_id: string
  timestamp: string
  vulnerabilities: Array<{
    type: string
    severity: "low" | "medium" | "high" | "critical"
    description: string
    location: string
    recommendation: string
  }>
  security_score: number
  recommendations: string[]
}

export class SecurityService {
  private redis: Redis
  private supabase: any

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  }

  // Rate limiting
  async checkRateLimit(
    identifier: string,
    config: RateLimitConfig = {
      window_ms: 60000, // 1 minute
      max_requests: 100,
      block_duration_ms: 300000, // 5 minutes
    },
  ): Promise<{ allowed: boolean; remaining: number; reset_time: number }> {
    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const windowStart = now - config.window_ms

    // Check if currently blocked
    const blockKey = `blocked:${identifier}`
    const blocked = await this.redis.get(blockKey)
    if (blocked) {
      return {
        allowed: false,
        remaining: 0,
        reset_time: now + config.block_duration_ms,
      }
    }

    // Get current request count in window
    const requests = await this.redis.zcount(key, windowStart, now)

    if (requests >= config.max_requests) {
      // Block the identifier
      await this.redis.setex(blockKey, Math.floor(config.block_duration_ms / 1000), "1")

      // Log security event
      await this.logSecurityEvent({
        id: `rate_limit_${now}`,
        type: "rate_limit_exceeded",
        severity: "medium",
        ip_address: identifier,
        user_agent: "",
        details: { requests, limit: config.max_requests },
        timestamp: new Date().toISOString(),
        blocked: true,
      })

      return {
        allowed: false,
        remaining: 0,
        reset_time: now + config.block_duration_ms,
      }
    }

    // Add current request
    await this.redis.zadd(key, now, `${now}-${Math.random()}`)
    await this.redis.expire(key, Math.floor(config.window_ms / 1000))

    // Clean old entries
    await this.redis.zremrangebyscore(key, 0, windowStart)

    return {
      allowed: true,
      remaining: config.max_requests - requests - 1,
      reset_time: now + config.window_ms,
    }
  }

  // Input validation and sanitization
  sanitizeInput(input: string, type: "html" | "sql" | "javascript" = "html"): string {
    if (!input || typeof input !== "string") return ""

    switch (type) {
      case "html":
        return input
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;")
          .replace(/\//g, "&#x2F;")

      case "sql":
        return input.replace(/['";\\]/g, "\\$&").replace(/\0/g, "\\0")

      case "javascript":
        return input
          .replace(/\\/g, "\\\\")
          .replace(/'/g, "\\'")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t")

      default:
        return input
    }
  }

  // SQL injection detection
  detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|\/\*|\*\/|;)/,
      /(\b(OR|AND)\b.*=.*)/i,
      /('.*'|".*")/,
      /(\bUNION\b.*\bSELECT\b)/i,
    ]

    return sqlPatterns.some((pattern) => pattern.test(input))
  }

  // XSS detection
  detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*>/gi,
    ]

    return xssPatterns.some((pattern) => pattern.test(input))
  }

  // Password security
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(32).toString("hex")
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
    return `${salt}:${derivedKey.toString("hex")}`
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(":")
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
    return key === derivedKey.toString("hex")
  }

  validatePasswordStrength(password: string): {
    score: number
    feedback: string[]
    isValid: boolean
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 1
    else feedback.push("Password should be at least 8 characters long")

    if (password.length >= 12) score += 1
    else feedback.push("Consider using 12+ characters for better security")

    if (/[a-z]/.test(password)) score += 1
    else feedback.push("Include lowercase letters")

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push("Include uppercase letters")

    if (/[0-9]/.test(password)) score += 1
    else feedback.push("Include numbers")

    if (/[^A-Za-z0-9]/.test(password)) score += 1
    else feedback.push("Include special characters")

    if (!/(.)\1{2,}/.test(password)) score += 1
    else feedback.push("Avoid repeating characters")

    return {
      score,
      feedback,
      isValid: score >= 4,
    }
  }

  // Security scanning
  async performSecurityScan(): Promise<SecurityScanResult> {
    const scanId = `scan_${Date.now()}`
    const vulnerabilities: SecurityScanResult["vulnerabilities"] = []

    // Check for common vulnerabilities
    await this.checkEnvironmentVariables(vulnerabilities)
    await this.checkDependencies(vulnerabilities)
    await this.checkSecurityHeaders(vulnerabilities)
    await this.checkDatabaseSecurity(vulnerabilities)
    await this.checkAPIEndpoints(vulnerabilities)

    // Calculate security score
    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length
    const highCount = vulnerabilities.filter((v) => v.severity === "high").length
    const mediumCount = vulnerabilities.filter((v) => v.severity === "medium").length
    const lowCount = vulnerabilities.filter((v) => v.severity === "low").length

    const securityScore = Math.max(0, 100 - criticalCount * 25 - highCount * 10 - mediumCount * 5 - lowCount * 1)

    // Generate recommendations
    const recommendations = this.generateSecurityRecommendations(vulnerabilities)

    const result: SecurityScanResult = {
      scan_id: scanId,
      timestamp: new Date().toISOString(),
      vulnerabilities,
      security_score: securityScore,
      recommendations,
    }

    // Store scan result
    await this.supabase.from("security_scans").insert(result)

    return result
  }

  // Log security events
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // Store in database
    await this.supabase.from("security_events").insert(event)

    // Store in cache for quick access
    await this.redis.lpush("security_events", JSON.stringify(event))
    await this.redis.ltrim("security_events", 0, 999) // Keep last 1000 events

    // Send alert for high severity events
    if (event.severity === "high" || event.severity === "critical") {
      await this.sendSecurityAlert(event)
    }

    console.log(`🔒 Security event logged: ${event.type} (${event.severity})`)
  }

  // Get security metrics
  async getSecurityMetrics(timeRange: "1h" | "24h" | "7d" = "24h"): Promise<{
    total_events: number
    blocked_attempts: number
    top_threats: Array<{ type: string; count: number }>
    threat_sources: Array<{ ip: string; count: number }>
    security_score: number
  }> {
    const timeStart = this.getTimeRangeStart(timeRange)

    const { data: events } = await this.supabase.from("security_events").select("*").gte("timestamp", timeStart)

    const totalEvents = events?.length || 0
    const blockedAttempts = events?.filter((e) => e.blocked).length || 0

    // Aggregate threat types
    const threatTypes = events?.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topThreats = Object.entries(threatTypes || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))

    // Aggregate threat sources
    const threatSources = events?.reduce(
      (acc, event) => {
        acc[event.ip_address] = (acc[event.ip_address] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topSources = Object.entries(threatSources || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }))

    // Get latest security score
    const { data: latestScan } = await this.supabase
      .from("security_scans")
      .select("security_score")
      .order("timestamp", { ascending: false })
      .limit(1)

    const securityScore = latestScan?.[0]?.security_score || 0

    return {
      total_events: totalEvents,
      blocked_attempts: blockedAttempts,
      top_threats: topThreats,
      threat_sources: topSources,
      security_score: securityScore,
    }
  }

  // Private helper methods
  private async checkEnvironmentVariables(vulnerabilities: SecurityScanResult["vulnerabilities"]): Promise<void> {
    const requiredEnvVars = ["NEXTAUTH_SECRET", "JWT_SECRET", "ENCRYPTION_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        vulnerabilities.push({
          type: "missing_environment_variable",
          severity: "high",
          description: `Missing required environment variable: ${envVar}`,
          location: "Environment Configuration",
          recommendation: `Set the ${envVar} environment variable with a secure value`,
        })
      }
    }
  }

  private async checkDependencies(vulnerabilities: SecurityScanResult["vulnerabilities"]): Promise<void> {
    // This would typically use npm audit or similar
    // For now, we'll add a placeholder
    vulnerabilities.push({
      type: "dependency_check",
      severity: "low",
      description: "Regular dependency security check recommended",
      location: "package.json",
      recommendation: "Run 'npm audit' regularly to check for vulnerable dependencies",
    })
  }

  private async checkSecurityHeaders(vulnerabilities: SecurityScanResult["vulnerabilities"]): Promise<void> {
    const requiredHeaders = [
      "X-Frame-Options",
      "X-Content-Type-Options",
      "X-XSS-Protection",
      "Strict-Transport-Security",
      "Content-Security-Policy",
    ]

    // This would check actual HTTP responses
    // For now, we'll assume they need to be verified
    vulnerabilities.push({
      type: "security_headers",
      severity: "medium",
      description: "Security headers should be verified",
      location: "HTTP Response Headers",
      recommendation: "Ensure all required security headers are properly configured",
    })
  }

  private async checkDatabaseSecurity(vulnerabilities: SecurityScanResult["vulnerabilities"]): Promise<void> {
    // Check for common database security issues
    try {
      // This would perform actual database security checks
      const { data: users } = await this.supabase.from("users").select("count").limit(1)

      if (users) {
        // Database is accessible, which is good
        // Add more specific checks here
      }
    } catch (error) {
      vulnerabilities.push({
        type: "database_access",
        severity: "critical",
        description: "Database connection issues detected",
        location: "Database Configuration",
        recommendation: "Check database connection and security settings",
      })
    }
  }

  private async checkAPIEndpoints(vulnerabilities: SecurityScanResult["vulnerabilities"]): Promise<void> {
    // Check for API security issues
    const endpoints = ["/api/auth", "/api/users", "/api/admin"]

    for (const endpoint of endpoints) {
      // This would perform actual endpoint security checks
      vulnerabilities.push({
        type: "api_security",
        severity: "low",
        description: `API endpoint security check: ${endpoint}`,
        location: endpoint,
        recommendation: "Ensure proper authentication and authorization for API endpoints",
      })
    }
  }

  private generateSecurityRecommendations(vulnerabilities: SecurityScanResult["vulnerabilities"]): string[] {
    const recommendations = new Set<string>()

    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length
    const highCount = vulnerabilities.filter((v) => v.severity === "high").length

    if (criticalCount > 0) {
      recommendations.add("Address critical vulnerabilities immediately")
    }

    if (highCount > 0) {
      recommendations.add("Prioritize high-severity vulnerabilities")
    }

    recommendations.add("Implement regular security scanning")
    recommendations.add("Keep dependencies up to date")
    recommendations.add("Use strong authentication mechanisms")
    recommendations.add("Implement proper input validation")
    recommendations.add("Configure security headers correctly")
    recommendations.add("Monitor security events continuously")

    return Array.from(recommendations)
  }

  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implementation for sending security alerts
    console.log(`🚨 Security alert: ${event.type} - ${event.severity}`)
  }

  private getTimeRangeStart(range: "1h" | "24h" | "7d"): string {
    const now = Date.now()
    switch (range) {
      case "1h":
        return new Date(now - 60 * 60 * 1000).toISOString()
      case "24h":
        return new Date(now - 24 * 60 * 60 * 1000).toISOString()
      case "7d":
        return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
}

export const securityService = new SecurityService()
