// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.

import { NextRequest, NextResponse } from "next/server"
import { bruteForceProtection as serverProtection } from "@/lib/brute-force-protection"

// Detect if Upstash Redis is configured; if not, use a permissive mock fallback
const hasRedis = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

const mockProtection = {
  async checkLoginAttempt(
    _identifier: string,
    _ipAddress: string,
    _userAgent: string,
    success: boolean,
  ) {
    return {
      allowed: true,
      remainingAttempts: 5,
      requiresCaptcha: false,
      isBlocked: false,
      message: success ? "Login successful (mock)" : "OK (mock)",
    }
  },
  async getAccountStatus(_identifier: string) {
    return {
      attempts: 0,
      isLocked: false,
      requiresCaptcha: false,
    }
  },
}

const protection = hasRedis ? serverProtection : (mockProtection as typeof serverProtection)

function getClientInfo(req: NextRequest) {
  const ip =
    (req.ip as string | null) ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"
  return { ip, userAgent }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const action = body?.action as string

    if (!action) {
      return NextResponse.json({ error: "Missing 'action'" }, { status: 400 })
    }

    const { ip, userAgent } = getClientInfo(req)

    if (action === "check") {
      const identifier = (body?.identifier as string) || body?.email || "unknown"
      const success = Boolean(body?.success)

      const result = await protection.checkLoginAttempt(identifier, ip, userAgent, success)
      return NextResponse.json(result)
    }

    if (action === "status") {
      const email = body?.email as string
      if (!email) {
        return NextResponse.json({ error: "Missing 'email' for status" }, { status: 400 })
      }
      const result = await protection.getAccountStatus(email)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Internal error",
        details: hasRedis ? undefined : "Using mock fallback (no Redis configured)",
      },
      { status: 500 },
    )
  }
}
