// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.

import { NextRequest, NextResponse } from "next/server"
// Temporarily disabled to avoid importing Redis client during build
// import { bruteForceProtection as serverProtection } from "@/lib/brute-force-protection"

// Endpoint is temporarily disabled for deployment stability

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { disabled: true, reason: "brute-force endpoint temporarily disabled" },
    { status: 503 },
  )
}
