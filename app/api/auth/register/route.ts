import { type NextRequest, NextResponse } from "next/server"

// Mock user database (in production, use a real database)
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 409 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, hash this password
      name,
      role: "customer",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ec4899&color=fff`,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    // Generate token (simplified for demo)
    const token = `token_${newUser.id}_${Date.now()}`

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ",
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 })
  }
}
