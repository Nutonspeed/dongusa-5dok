import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { address } = await request.json()

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "ที่อยู่ไม่ถูกต้อง" }, { status: 400 })
    }

    console.log(`Updating address for order ${params.id}:`, address)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: "อัพเดทที่อยู่สำเร็จ",
      orderId: params.id,
      newAddress: address.trim(),
    })
  } catch (error) {
    console.error("Address update error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัพเดทที่อยู่" }, { status: 500 })
  }
}
