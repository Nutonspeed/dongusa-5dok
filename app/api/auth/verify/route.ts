import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, message: "ไม่พบ token" }, { status: 400 })
    }

    const response = await AuthService.verifyToken(token)

    if (response.success) {
      return NextResponse.json(response)
    } else {
      return NextResponse.json(response, { status: 401 })
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบ token" }, { status: 500 })
  }
}
