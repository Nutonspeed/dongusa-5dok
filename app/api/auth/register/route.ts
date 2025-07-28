import { type NextRequest, NextResponse } from "next/server"

interface RegisterRequest {
  email: string
  password: string
  name: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { email, password, name } = body

    console.log("📝 User registration attempt:", email)

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await checkUserExists(email)
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 409 },
      )
    }

    // Create new user
    const newUser = await createUser(email, password, name)

    // Generate user session token
    const token = generateUserToken(newUser.id)

    console.log("✅ User registration successful")

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
      },
      token,
    })
  } catch (error) {
    console.error("❌ User registration error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

async function checkUserExists(email: string): Promise<boolean> {
  // Mock check - in production, check database
  const existingEmails = ["user@sofacover.com", "customer@sofacover.com"]
  return existingEmails.includes(email)
}

async function createUser(email: string, password: string, name: string) {
  // Mock user creation - in production, save to database
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    name,
    avatar: "/placeholder-user.jpg",
    createdAt: new Date().toISOString(),
  }

  console.log("👤 Created new user:", newUser)
  return newUser
}

function generateUserToken(userId: string): string {
  return `user_${userId}_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`
}

export async function GET() {
  return NextResponse.json(
    {
      message: "User registration endpoint - use POST method",
    },
    { status: 405 },
  )
}
