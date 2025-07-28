import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
          authenticated: false,
        },
        { status: 401 },
      )
    }

    // Validate user token
    const user = await validateUserToken(token)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
          authenticated: false,
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("❌ User token verification error:", error)

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

async function validateUserToken(token: string) {
  // Simple token validation - in production, use proper JWT or database lookup
  if (!token || !token.startsWith("user_")) {
    return null
  }

  // Mock user data based on token
  return {
    id: "user-001",
    email: "user@sofacover.com",
    name: "ลูกค้าทดสอบ",
    avatar: "/placeholder-user.jpg",
  }
}

export async function POST() {
  return NextResponse.json(
    {
      message: "User token verification endpoint - use GET method",
    },
    { status: 405 },
  )
}
