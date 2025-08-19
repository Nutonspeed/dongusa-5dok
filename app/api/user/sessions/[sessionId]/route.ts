export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { sessionManager } from "@/lib/session-management"

export async function DELETE(request: NextRequest, { params }: { params: { sessionId: string } }) {
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

    // Don't allow terminating current session
    if (params.sessionId === currentSessionId) {
      return NextResponse.json({ error: "Cannot terminate current session" }, { status: 400 })
    }

    // Verify the session belongs to the current user
    const userSessions = await sessionManager.getUserSessions(validation.session.userId)
    const targetSession = userSessions.find((s) => s.id === params.sessionId)

    if (!targetSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Terminate the session
    await sessionManager.destroySession(params.sessionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Session termination error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
