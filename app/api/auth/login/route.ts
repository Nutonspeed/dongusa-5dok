import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 })
    }

    const response = await AuthService.login(email, password)

    if (response.success) {
      return NextResponse.json(response)
    } else {
      return NextResponse.json(response, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }, { status: 500 })
  }
}
