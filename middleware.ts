import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED = [
  /^\/admin(\/|$)/,
  /^\/api\/admin(\/|$)/,
  /^\/profile(\/|$)/,
  /^\/orders(\/|$)/,
  /^\/checkout(\/|$)/,
  /^\/auth\/callback(\/|$)/,
]

// endpoints ที่ต้อง “ผ่าน” แม้จะอยู่ใต้ /api/admin (ไว้เทส/alias)
const SAFE_PASSTHROUGH = [
  /^\/api\/admin\/export\/orders(\/|$)/,
  /^\/api\/orders\/update-status(\/|$)/,
]

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // 0) Maintenance rewrite แบบเบา (ไม่ยุ่งกับ /maintenance เอง)
  if (process.env.MAINTENANCE === "1" && !pathname.startsWith("/maintenance")) {
    const url = new URL("/maintenance", req.url)
    return NextResponse.rewrite(url)
  }

  // 1) QA bypass (ชนะทุกอย่าง) + allow SAFE_PASSTHROUGH เสมอ
  if (process.env.QA_BYPASS_AUTH === "1" || SAFE_PASSTHROUGH.some(r => r.test(pathname))) {
    return NextResponse.next()
  }

  // 2) Guard เฉพาะเส้นที่ต้องป้องกัน
  const needsAuth = PROTECTED.some(r => r.test(pathname))
  if (!needsAuth) return NextResponse.next()

  // 3) Optional Supabase check (edge-safe). ถ้า lib/env ยังไม่พร้อม ให้ปล่อยผ่าน dev เพื่อกัน 500
  try {
    const { createMiddlewareClient } = await import("@supabase/ssr")
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return res
  } catch (e) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next()
  }

  // 4) Redirect ไป signin เมื่อไม่มีสิทธิ์
  const url = new URL("/auth/signin", req.url)
  url.searchParams.set("redirect", pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/checkout",
    "/auth/callback",
    "/api/admin/:path*",
    "/api/user/:path*",
  ],
}

