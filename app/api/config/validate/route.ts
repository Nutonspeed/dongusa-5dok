import { type NextRequest, NextResponse } from "next/server"
import { dynamicConfigSystem } from "@/lib/dynamic-config-system"

// POST /api/config/validate - Validate configuration values
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Missing or invalid API key",
          },
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { values } = body

    if (!values || typeof values !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body. Expected values object.",
          },
        },
        { status: 400 },
      )
    }

    const validationResults = []
    const fields = await dynamicConfigSystem.getFields()

    // Validate each value
    for (const [key, value] of Object.entries(values)) {
      const field = fields.find((f) => f.key === key)

      if (!field) {
        validationResults.push({
          key,
          isValid: false,
          errors: [`Field '${key}' not found`],
          warnings: [],
          suggestions: [],
        })
        continue
      }

      const validation = await dynamicConfigSystem.validateValue(field, value)
      validationResults.push({
        key,
        ...validation,
      })
    }

    const allValid = validationResults.every((result) => result.isValid)
    const totalErrors = validationResults.reduce((sum, result) => sum + result.errors.length, 0)
    const totalWarnings = validationResults.reduce((sum, result) => sum + result.warnings.length, 0)

    return NextResponse.json({
      success: true,
      data: {
        isValid: allValid,
        results: validationResults,
        summary: {
          totalFields: validationResults.length,
          validFields: validationResults.filter((r) => r.isValid).length,
          invalidFields: validationResults.filter((r) => !r.isValid).length,
          totalErrors,
          totalWarnings,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    })
  } catch (error) {
    console.error("Config Validation Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to validate configuration",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
