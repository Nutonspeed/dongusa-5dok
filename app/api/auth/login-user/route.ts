import { type NextRequest, NextResponse } from "next/server"

interface LoginRequest {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    console.log("🔐 User login attempt:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Check user credentials
    const user = await validateUserCredentials(email, password)

    if (!user) {
      console.log("❌ Invalid user credentials")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Generate user session token
    const token = generateUserToken(user.id)

    console.log("✅ User login successful")

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    })
  } catch (error) {
    console.error("❌ User login error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

async function validateUserCredentials(email: string, password: string) {
  // Demo user credentials
  const validUsers = [
    {
      id: "user-001",
      email: "user@sofacover.com",
      password: "user123",
      name: "ลูกค้าทดสอบ",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: "user-002",
      email: "customer@sofacover.com",
      password: "customer123",
      name: "คุณสมชาย ใจดี",
      avatar: "/placeholder-user.jpg",
    },
  ]

  return validUsers.find((user) => user.email === email && user.password === password) || null
}

function generateUserToken(userId: string): string {
  return `user_${userId}_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`
}

export async function GET() {
  return NextResponse.json(
    {
      message: "User login endpoint - use POST method",
    },
    { status: 405 },
  )
}
