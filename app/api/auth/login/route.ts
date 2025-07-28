import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

interface LoginRequest {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    console.log("🔐 Admin login attempt:", email)

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

    // Check admin credentials
    const isValidAdmin = await validateAdminCredentials(email, password)

    if (!isValidAdmin) {
      console.log("❌ Invalid admin credentials")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Generate admin session token
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expiresAt,
      path: "/",
    })

    console.log("✅ Admin login successful")

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        email,
        role: "admin",
        name: "ผู้ดูแลระบบ",
      },
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("❌ Admin login error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

async function validateAdminCredentials(email: string, password: string): Promise<boolean> {
  // Demo credentials
  const validCredentials = [
    { email: "admin@sofacover.com", password: "admin123" },
    { email: "manager@sofacover.com", password: "manager123" },
  ]

  return validCredentials.some((cred) => cred.email === email && cred.password === password)
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Admin login endpoint - use POST method",
    },
    { status: 405 },
  )
}
