import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, type, validation } = body

    const errors: string[] = []
    const warnings: string[] = []

    // Basic validation
    if (!key) {
      errors.push("Configuration key is required")
    }

    if (key && !/^[a-zA-Z0-9._-]+$/.test(key)) {
      errors.push("Configuration key can only contain letters, numbers, dots, underscores, and hyphens")
    }

    // Type validation
    if (type && value !== null && value !== undefined) {
      switch (type) {
        case "number":
          if (isNaN(Number(value))) {
            errors.push("Value must be a valid number")
          }
          break
        case "boolean":
          if (typeof value !== "boolean" && value !== "true" && value !== "false") {
            errors.push("Value must be true or false")
          }
          break
        case "json":
          try {
            JSON.parse(typeof value === "string" ? value : JSON.stringify(value))
          } catch {
            errors.push("Value must be valid JSON")
          }
          break
        case "date":
          if (isNaN(Date.parse(value))) {
            errors.push("Value must be a valid date")
          }
          break
      }
    }

    // Custom validation rules
    if (validation) {
      const { required, min, max, pattern, enum: enumValues } = validation

      if (required && (value === null || value === undefined || value === "")) {
        errors.push("Value is required")
      }

      if (typeof value === "string") {
        if (min && value.length < min) {
          errors.push(`Value must be at least ${min} characters`)
        }
        if (max && value.length > max) {
          errors.push(`Value must be at most ${max} characters`)
        }
        if (pattern && !new RegExp(pattern).test(value)) {
          errors.push("Value does not match required pattern")
        }
      }

      if (typeof value === "number") {
        if (min && value < min) {
          errors.push(`Value must be at least ${min}`)
        }
        if (max && value > max) {
          errors.push(`Value must be at most ${max}`)
        }
      }

      if (enumValues && !enumValues.includes(value)) {
        errors.push(`Value must be one of: ${enumValues.join(", ")}`)
      }
    }

    // Security warnings
    if (key && key.toLowerCase().includes("password")) {
      warnings.push("Consider using environment variables for sensitive data")
    }

    if (key && key.toLowerCase().includes("api_key")) {
      warnings.push("API keys should be stored securely")
    }

    return NextResponse.json({
      isValid: errors.length === 0,
      errors,
      warnings,
    })
  } catch (error) {
    console.error("Validation Error:", error)
    return NextResponse.json({ error: "Validation failed" }, { status: 500 })
  }
}
