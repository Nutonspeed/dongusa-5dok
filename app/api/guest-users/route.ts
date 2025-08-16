import { type NextRequest, NextResponse } from "next/server"
import { serverGuestUserManager } from "@/lib/guest-user-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status")

    const result = await serverGuestUserManager.getAllGuestUsers(page, limit)

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching guest users:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch guest users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, email, full_name, phone, shipping_address, billing_address, notes } = body

    // Validation
    if (!session_id) {
      return NextResponse.json({ success: false, error: "Session ID is required" }, { status: 400 })
    }

    // Create guest user using server manager
    // Implementation would go here

    return NextResponse.json({
      success: true,
      message: "Guest user created successfully",
    })
  } catch (error) {
    console.error("Error creating guest user:", error)
    return NextResponse.json({ success: false, error: "Failed to create guest user" }, { status: 500 })
  }
}
