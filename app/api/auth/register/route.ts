import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    if (!userData.email || !userData.password || !userData.name) {
      return NextResponse.json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    if (userData.password.length < 6) {
      return NextResponse.json({ success: false, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 })
    }

    const response = await AuthService.register(userData)

    if (response.success) {
      return NextResponse.json(response)
    } else {
      return NextResponse.json(response, { status: 400 })
    }
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" }, { status: 500 })
  }
}
