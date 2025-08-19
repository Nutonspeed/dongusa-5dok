import { type NextRequest, NextResponse } from "next/server"
import { sessionManager } from "@/lib/session-management"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    // Validate current session
    const validation = await sessionManager.validateSession(
      sessionId,
      request.headers.get("x-forwarded-for") || "unknown",
      request.headers.get("user-agent") || "",
    )

    if (!validation.isValid || !validation.session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Get all user sessions
    const sessions = await sessionManager.getUserSessions(validation.session.userId)

    // Format sessions for client
    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      isCurrent: session.id === sessionId,
    }))

    return NextResponse.json({ sessions: formattedSessions })
  } catch (error) {
    console.error("Sessions API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
