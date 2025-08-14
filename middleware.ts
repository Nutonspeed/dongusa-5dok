import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED = [
  /^\/admin(\/|$)/, /^\/api\/admin(\/|$)/, /^\/profile(\/|$)/,
  /^\/orders(\/|$)/, /^\/checkout(\/|$)/, /^\/auth\/callback(\/|$)/,
]

// endpoints ที่ต้อง “ผ่าน” แม้จะอยู่ใต้ /api/admin (ไว้เทส/alias)
const SAFE_PASSTHROUGH = [
  /^\/api\/admin\/export\/orders(\/|$)/,
  /^\/api\/orders\/update-status(\/|$)/,
]

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // 0) Maintenance (rewrite เบา)
  if (process.env.MAINTENANCE === "1" && !pathname.startsWith("/maintenance")) {
    return NextResponse.rewrite(new URL("/maintenance", req.url))
  }

  // 1) QA bypass (ชนะทุกอย่าง) + allow SAFE_PASSTHROUGH เสมอ
  if (process.env.QA_BYPASS_AUTH === "1" || SAFE_PASSTHROUGH.some(r => r.test(pathname))) {
    return NextResponse.next()
  }

  // 2) เฉพาะเส้นที่ป้องกัน
  const needsAuth = PROTECTED.some(r => r.test(pathname))
  if (!needsAuth) return NextResponse.next()

  // 3) ถ้ายังไม่มี env Supabase → redirect ทันที (กัน 500)
  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!hasSupabase) {
    const url = new URL("/auth/signin", req.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // 4) ตรวจ user แบบ edge-safe (ถ้าล้ม ให้ปล่อยผ่านใน dev, block ใน prod)
  try {
    const { createMiddlewareClient } = await import("@supabase/ssr")
    const res = NextResponse.next()
    // @ts-ignore – package จะอ่าน env เอง
    const supabase = createMiddlewareClient({ req, res })
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return res
  } catch {
    if (process.env.NODE_ENV !== "production") return NextResponse.next()
  }

  const url = new URL("/auth/signin", req.url)
  url.searchParams.set("redirect", pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    "/admin/:path*","/profile/:path*","/orders/:path*","/checkout",
    "/auth/callback","/api/admin/:path*","/api/user/:path*",
  ],
}

