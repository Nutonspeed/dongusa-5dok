import { type NextRequest, NextResponse } from "next/server"
import { sessionManager } from "@/lib/session-management"

export async function POST(request: NextRequest) {
  try {
    const currentSessionId = request.cookies.get("session_id")?.value

    if (!currentSessionId) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    // Validate current session
    const validation = await sessionManager.validateSession(
      currentSessionId,
      request.headers.get("x-forwarded-for") || "unknown",
      request.headers.get("user-agent") || "",
    )

    if (!validation.isValid || !validation.session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Terminate all other sessions for this user
    const terminatedCount = await sessionManager.destroyAllUserSessions(validation.session.userId, currentSessionId)

    return NextResponse.json({
      success: true,
      terminatedSessions: terminatedCount,
    })
  } catch (error) {
    console.error("Bulk session termination error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
