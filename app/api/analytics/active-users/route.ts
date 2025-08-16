import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock data - in production, get from database
    const activeUsers = Math.floor(Math.random() * 100) + 50

    return NextResponse.json({ activeUsers })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get active users" }, { status: 500 })
  }
}
