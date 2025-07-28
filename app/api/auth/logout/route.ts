import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    console.log("🚪 Admin logout request")

    const cookieStore = await cookies()

    // Clear the admin session cookie
    cookieStore.delete("admin-session")

    console.log("✅ Admin logout successful")

    return NextResponse.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    console.error("❌ Logout error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Admin logout endpoint - use POST method",
    },
    { status: 405 },
  )
}
