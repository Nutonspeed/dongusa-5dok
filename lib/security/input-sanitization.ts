// Input sanitization and validation utilities
import DOMPurify from "isomorphic-dompurify"

export interface SanitizationOptions {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  stripTags?: boolean
  maxLength?: number
}

export class InputSanitizer {
  // HTML sanitization
  static sanitizeHtml(input: string, options: SanitizationOptions = {}): string {
    const config: any = {}

    if (options.allowedTags) {
      config.ALLOWED_TAGS = options.allowedTags
    }

    if (options.allowedAttributes) {
      config.ALLOWED_ATTR = Object.keys(options.allowedAttributes)
    }

    if (options.stripTags) {
      config.ALLOWED_TAGS = []
      config.KEEP_CONTENT = true
    }

    let sanitized = DOMPurify.sanitize(input, config)

    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength)
    }

    return sanitized
  }

  // SQL injection prevention
  static sanitizeSql(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "")
      .replace(/xp_/g, "")
      .replace(/sp_/g, "")
  }

  // XSS prevention
  static escapeHtml(input: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    }

    return input.replace(/[&<>"'/]/g, (s) => map[s])
  }

  // URL sanitization
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url)

      // Only allow http and https protocols
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol")
      }

      return parsed.toString()
    } catch {
      return ""
    }
  }

  // File name sanitization
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/\.{2,}/g, ".")
      .replace(/^\.+|\.+$/g, "")
      .substring(0, 255)
  }

  // Email sanitization
  static sanitizeEmail(email: string): string {
    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, "")
  }

  // Phone number sanitization
  static sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+()-\s]/g, "")
  }

  // Remove null bytes and control characters
  static removeControlCharacters(input: string): string {
    return input.replace(/[\x00-\x1F\x7F]/g, "")
  }

  // Comprehensive text sanitization
  static sanitizeText(input: string, options: SanitizationOptions = {}): string {
    let sanitized = input

    // Remove control characters
    sanitized = this.removeControlCharacters(sanitized)

    // Trim whitespace
    sanitized = sanitized.trim()

    // Apply length limit
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength)
    }

    // Strip HTML tags if requested
    if (options.stripTags) {
      sanitized = sanitized.replace(/<[^>]*>/g, "")
    }

    return sanitized
  }
}

// Validation utilities
export class InputValidator {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  // URL validation
  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ["http:", "https:"].includes(parsed.protocol)
    } catch {
      return false
    }
  }

  // Phone validation
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s()-]{10,}$/
    return phoneRegex.test(phone)
  }

  // Strong password validation
  static isStrongPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character")
    }

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      errors.push("Password cannot contain repeated characters")
    }

    if (/123|abc|qwe|password/i.test(password)) {
      errors.push("Password cannot contain common patterns")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // SQL injection detection
  static containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(--|\/\*|\*\/)/,
      /(\b(xp_|sp_)\w+)/i,
      /(';\s*(DROP|DELETE|INSERT|UPDATE))/i,
    ]

    return sqlPatterns.some((pattern) => pattern.test(input))
  }

  // XSS detection
  static containsXss(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^>]*>/gi,
      /<link\b[^>]*>/gi,
      /<meta\b[^>]*>/gi,
    ]

    return xssPatterns.some((pattern) => pattern.test(input))
  }

  // Path traversal detection
  static containsPathTraversal(input: string): boolean {
    const pathTraversalPatterns = [/\.\.\//g, /\.\.\\/g, /%2e%2e%2f/g, /%2e%2e%5c/g, /\.\.%2f/g, /\.\.%5c/g]

    return pathTraversalPatterns.some((pattern) => pattern.test(input))
  }

  // Command injection detection
  static containsCommandInjection(input: string): boolean {
    const commandPatterns = [
      /[;&|`$(){}[\]]/,
      /\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ping|wget|curl|nc|telnet|ssh|ftp)\b/i,
    ]

    return commandPatterns.some((pattern) => pattern.test(input))
  }
}

// Rate limiting for security
export class SecurityRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()

  checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowMs: number,
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now > record.resetTime) {
      // First attempt or window expired
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      })

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetTime: now + windowMs,
      }
    }

    if (record.count >= maxAttempts) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      }
    }

    // Increment attempt count
    record.count++
    this.attempts.set(identifier, record)

    return {
      allowed: true,
      remaining: maxAttempts - record.count,
      resetTime: record.resetTime,
    }
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

// Export utilities
export const inputSanitizer = new InputSanitizer()
export const inputValidator = new InputValidator()
export const securityRateLimiter = new SecurityRateLimiter()

// Cleanup rate limiter periodically
if (typeof window !== "undefined") {
  setInterval(() => {
    securityRateLimiter.cleanup()
  }, 60000) // Cleanup every minute
}
