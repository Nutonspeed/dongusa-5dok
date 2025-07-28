import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No session found",
          authenticated: false,
        },
        { status: 401 },
      )
    }

    // Validate session token
    const isValidSession = await validateSessionToken(sessionToken)

    if (!isValidSession) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid session",
          authenticated: false,
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        email: "admin@sofacover.com",
        role: "admin",
        name: "ผู้ดูแลระบบ",
      },
    })
  } catch (error) {
    console.error("❌ Session verification error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        authenticated: false,
      },
      { status: 500 },
    )
  }
}

async function validateSessionToken(token: string): Promise<boolean> {
  // Simple token validation - in production, use proper JWT or database lookup
  return token && token.length > 10
}

export async function POST() {
  return NextResponse.json(
    {
      message: "Session verification endpoint - use GET method",
    },
    { status: 405 },
  )
}
