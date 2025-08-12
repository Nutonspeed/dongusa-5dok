import { type NextRequest, NextResponse } from "next/server"
import { dynamicConfigSystem } from "@/lib/dynamic-config-system"

// GET /api/config - Get all configuration values
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    // Verify API key (in production, implement proper authentication)
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

    const values = await dynamicConfigSystem.getAllValues(category || undefined)

    return NextResponse.json({
      success: true,
      data: values,
      meta: {
        category: category || "all",
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    })
  } catch (error) {
    console.error("Config API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve configuration",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}

// POST /api/config - Bulk update configuration values
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
    const { values, userId = "api-user" } = body

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

    const results = []
    const errors = []

    // Process each value
    for (const [key, value] of Object.entries(values)) {
      try {
        // Find field by key
        const fields = await dynamicConfigSystem.getFields()
        const field = fields.find((f) => f.key === key)

        if (!field) {
          errors.push(`Field '${key}' not found`)
          continue
        }

        await dynamicConfigSystem.setValue(field.id, value, userId)
        results.push({ key, status: "updated" })
      } catch (error) {
        errors.push(`Failed to update '${key}': ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      data: {
        updated: results,
        errors: errors,
      },
      meta: {
        timestamp: new Date().toISOString(),
        totalProcessed: Object.keys(values).length,
        successful: results.length,
        failed: errors.length,
      },
    })
  } catch (error) {
    console.error("Config Bulk Update Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update configuration",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
