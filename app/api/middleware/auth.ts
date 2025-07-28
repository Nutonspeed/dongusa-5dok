// Authentication and authorization middleware
import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
    permissions: string[]
  }
}

interface AuthOptions {
  required?: boolean
  roles?: string[]
  permissions?: string[]
}

export function withAuth(options: AuthOptions = {}) {
  return async function authMiddleware(
    request: AuthenticatedRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      const token = extractToken(request)

      if (!token) {
        if (options.required !== false) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "UNAUTHORIZED",
                message: "Authentication token required",
              },
            },
            { status: 401 },
          )
        }
        return handler(request)
      }

      // Verify JWT token
      const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as any

      // In a real app, you'd fetch user details from database
      const user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role || "user",
        permissions: decoded.permissions || [],
      }

      // Check role requirements
      if (options.roles && !options.roles.includes(user.role)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Insufficient role permissions",
            },
          },
          { status: 403 },
        )
      }

      // Check permission requirements
      if (options.permissions) {
        const hasPermission = options.permissions.some((permission) => user.permissions.includes(permission))

        if (!hasPermission) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "FORBIDDEN",
                message: "Insufficient permissions",
              },
            },
            { status: 403 },
          )
        }
      }

      request.user = user
      return handler(request)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid authentication token",
          },
        },
        { status: 401 },
      )
    }
  }
}

function extractToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Check cookie
  const tokenCookie = request.cookies.get("auth_token")
  if (tokenCookie) {
    return tokenCookie.value
  }

  return null
}

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(limit = 100, windowMs = 60000, keyGenerator?: (req: NextRequest) => string) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    const key = keyGenerator ? keyGenerator(request) : getClientIP(request)
    const now = Date.now()
    const record = rateLimitMap.get(key)

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
      return addRateLimitHeaders(await handler(request), limit, limit - 1, Math.ceil((now + windowMs) / 1000))
    }

    if (record.count >= limit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Rate limit exceeded",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((record.resetTime - now) / 1000)),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(record.resetTime / 1000)),
          },
        },
      )
    }

    record.count++
    const remaining = limit - record.count
    const response = await handler(request)

    return addRateLimitHeaders(response, limit, remaining, Math.ceil(record.resetTime / 1000))
  }
}

function addRateLimitHeaders(response: NextResponse, limit: number, remaining: number, reset: number): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(limit))
  response.headers.set("X-RateLimit-Remaining", String(remaining))
  response.headers.set("X-RateLimit-Reset", String(reset))
  return response
}

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

// Validation middleware
export function withValidation<T>(schema: any) {
  return async function validationMiddleware(
    request: NextRequest,
    handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      const body = await request.json()

      // In a real app, you'd use a validation library like Zod or Joi
      const validatedData = validateData(body, schema)

      return handler(request, validatedData)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.message,
          },
        },
        { status: 400 },
      )
    }
  }
}

function validateData(data: any, schema: any): any {
  // Simplified validation - in a real app, use a proper validation library
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        throw new Error(`Field '${field}' is required`)
      }
    }
  }

  return data
}

// Error handling middleware
export function withErrorHandling() {
  return async function errorHandlingMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      return await handler(request)
    } catch (error) {
      console.error("API Error:", error)

      // Log error to monitoring service
      if (process.env.NODE_ENV === "production") {
        // Send to error tracking service (Sentry, etc.)
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An internal server error occurred",
            ...(process.env.NODE_ENV === "development" && {
              details: error.message,
              stack: error.stack,
            }),
          },
        },
        { status: 500 },
      )
    }
  }
}

// Compose multiple middlewares
export function compose(...middlewares: any[]) {
  return async function composedMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    let composedHandler = handler

    for (let i = middlewares.length - 1; i >= 0; i--) {
      const middleware = middlewares[i]
      const currentHandler = composedHandler
      composedHandler = (req: NextRequest) => middleware(req, currentHandler)
    }

    return composedHandler(request)
  }
}
