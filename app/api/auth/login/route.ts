import { type NextRequest, NextResponse } from "next/server"
import { mockUsers, generateToken } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 })
    }

    // Find user
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, message: "บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ" }, { status: 403 })
    }

    // Generate token
    const token = generateToken(user.id)

    // Update last login
    user.lastLoginAt = new Date().toISOString()

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 })
  }
}
