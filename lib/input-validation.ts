import { z } from "zod"
import DOMPurify from "isomorphic-dompurify"

// Validation schemas
export const ValidationSchemas = {
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character",
    ),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  phone: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, "Invalid phone number format"),
  url: z.string().url("Invalid URL format"),
  text: z.string().max(1000, "Text must not exceed 1000 characters"),
  number: z.number().min(0, "Number must be positive"),
  currency: z.number().min(0, "Amount must be positive").max(999999, "Amount too large"),
}

export class InputValidationService {
  private static instance: InputValidationService
  private suspiciousPatterns: RegExp[]
  private sqlInjectionPatterns: RegExp[]
  private xssPatterns: RegExp[]

  constructor() {
    this.suspiciousPatterns = [
      /(<script|<\/script>)/gi,
      /(javascript:|vbscript:|onload=|onerror=)/gi,
      /(union|select|insert|update|delete|drop|create|alter)/gi,
      /(\||&|;|`|\$\(|\${)/g,
    ]

    this.sqlInjectionPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(--|\/\*|\*\/|;|'|"|\||&)/g,
      /(\bor\b|\band\b).*?[=<>]/gi,
    ]

    this.xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<object[^>]*>.*?<\/object>/gi,
    ]
  }

  static getInstance(): InputValidationService {
    if (!InputValidationService.instance) {
      InputValidationService.instance = new InputValidationService()
    }
    return InputValidationService.instance
  }

  // Comprehensive input sanitization
  sanitizeInput(
    input: string,
    options: {
      allowHtml?: boolean
      maxLength?: number
      stripWhitespace?: boolean
    } = {},
  ): string {
    if (!input || typeof input !== "string") return ""

    let sanitized = input

    // Strip whitespace if requested
    if (options.stripWhitespace) {
      sanitized = sanitized.trim()
    }

    // Truncate if max length specified
    if (options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength)
    }

    // HTML sanitization
    if (options.allowHtml) {
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
        ALLOWED_ATTR: [],
      })
    } else {
      // Remove all HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, "")
    }

    // Remove suspicious patterns
    this.suspiciousPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "")
    })

    return sanitized
  }

  // Validate against SQL injection
  validateSqlInjection(input: string): { isValid: boolean; threats: string[] } {
    const threats: string[] = []

    this.sqlInjectionPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push(`SQL injection pattern ${index + 1} detected`)
      }
    })

    return {
      isValid: threats.length === 0,
      threats,
    }
  }

  // Validate against XSS
  validateXSS(input: string): { isValid: boolean; threats: string[] } {
    const threats: string[] = []

    this.xssPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push(`XSS pattern ${index + 1} detected`)
      }
    })

    return {
      isValid: threats.length === 0,
      threats,
    }
  }

  // Comprehensive validation
  validateInput(
    input: string,
    type: keyof typeof ValidationSchemas,
  ): {
    isValid: boolean
    errors: string[]
    sanitized: string
  } {
    const errors: string[] = []

    // Sanitize input first
    const sanitized = this.sanitizeInput(input, {
      stripWhitespace: true,
      maxLength: type === "text" ? 1000 : 255,
    })

    // Check for security threats
    const sqlCheck = this.validateSqlInjection(sanitized)
    const xssCheck = this.validateXSS(sanitized)

    if (!sqlCheck.isValid) {
      errors.push(...sqlCheck.threats)
    }

    if (!xssCheck.isValid) {
      errors.push(...xssCheck.threats)
    }

    // Schema validation
    try {
      ValidationSchemas[type].parse(sanitized)
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.issues.map((e: z.ZodIssue) => e.message))
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized,
    }
  }

  // Batch validation for forms
  validateForm(
    data: Record<string, any>,
    schema: Record<string, keyof typeof ValidationSchemas>,
  ): {
    isValid: boolean
    errors: Record<string, string[]>
    sanitized: Record<string, any>
  } {
    const errors: Record<string, string[]> = {}
    const sanitized: Record<string, any> = {}
    let isValid = true

    Object.entries(data).forEach(([key, value]) => {
      if (schema[key] && typeof value === "string") {
        const validation = this.validateInput(value, schema[key])

        if (!validation.isValid) {
          errors[key] = validation.errors
          isValid = false
        }

        sanitized[key] = validation.sanitized
      } else {
        sanitized[key] = value
      }
    })

    return { isValid, errors, sanitized }
  }

  // Rate limiting for validation requests
  private validationAttempts = new Map<string, { count: number; lastAttempt: number }>()

  checkRateLimit(identifier: string, maxAttempts = 100, windowMs = 60000): boolean {
    const now = Date.now()
    const attempts = this.validationAttempts.get(identifier)

    if (!attempts || now - attempts.lastAttempt > windowMs) {
      this.validationAttempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }

    if (attempts.count >= maxAttempts) {
      return false
    }

    attempts.count++
    attempts.lastAttempt = now
    return true
  }
}

export const inputValidator = InputValidationService.getInstance()
