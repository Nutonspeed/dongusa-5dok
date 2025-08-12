import { type NextRequest, NextResponse } from "next/server"
import { dynamicConfigSystem } from "@/lib/dynamic-config-system"

// GET /api/config/[category] - Get configuration values for a specific category
export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const { category } = params

    // Verify API key
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

    // Validate category
    const categories = await dynamicConfigSystem.getCategories()
    const validCategory = categories.find((cat) => cat.id === category)

    if (!validCategory) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Category '${category}' not found`,
            details: {
              availableCategories: categories.map((cat) => cat.id),
            },
          },
        },
        { status: 404 },
      )
    }

    const values = await dynamicConfigSystem.getAllValues(category)
    const fields = await dynamicConfigSystem.getFields(category)

    return NextResponse.json({
      success: true,
      data: values,
      meta: {
        category: category,
        categoryName: validCategory.name,
        fieldCount: fields.length,
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    })
  } catch (error) {
    console.error("Config Category API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve category configuration",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
