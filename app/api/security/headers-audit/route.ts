import { type NextRequest, NextResponse } from "next/server"
import { securityHeaders } from "@/lib/security-headers"

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const audit = await securityHeaders.auditSecurityHeaders(url)

    return NextResponse.json({
      success: true,
      audit,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
  // console.error("Security headers audit error:", error)

    return NextResponse.json({ error: "Failed to audit security headers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { headers } = await request.json()

    if (!headers || typeof headers !== "object") {
      return NextResponse.json({ error: "Headers object is required" }, { status: 400 })
    }

    const headersMap = new Headers()
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headersMap.set(key, value)
      }
    })

    const validation = securityHeaders.validateHeaders(headersMap)

    return NextResponse.json({
      success: true,
      validation,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
  // console.error("Security headers validation error:", error)

    return NextResponse.json({ error: "Failed to validate security headers" }, { status: 500 })
  }
}
