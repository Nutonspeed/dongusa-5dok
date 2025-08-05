import { type NextRequest, NextResponse } from "next/server"

// Mock users (same as in login route)
const mockUsers = [
  {
    id: "1",
    email: "admin@sofacover.com",
    name: "Admin User",
    role: "admin",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "2",
    email: "manager@sofacover.com",
    name: "Manager User",
    role: "manager",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "3",
    email: "staff@sofacover.com",
    name: "Staff User",
    role: "staff",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "4",
    email: "customer@sofacover.com",
    name: "Customer User",
    role: "customer",
    avatar: "/placeholder-user.jpg",
  },
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "ไม่พบ token" }, { status: 401 })
    }

    // Simple token validation (in production, use proper JWT verification)
    const userId = token.split("_")[1]
    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      return NextResponse.json({ error: "Token ไม่ถูกต้อง" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 })
  }
}
