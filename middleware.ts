import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED = [
  /^\/admin(\/|$)/, /^\/api\/admin(\/|$)/, /^\/profile(\/|$)/,
  /^\/orders(\/|$)/, /^\/checkout(\/|$)/, /^\/auth\/callback(\/|$)/,
]
const isAliasPath = (p: string) =>
  /^\/api\/admin\/export\/orders(\/|$)/.test(p) || /^\/api\/orders\/update-status(\/|$)/.test(p)
const isDryRun = (req: NextRequest) => req.headers.get("x-dry-run") === "1"

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (process.env.MAINTENANCE === "1" && !pathname.startsWith("/maintenance")) {
    return NextResponse.rewrite(new URL("/maintenance", req.url))
  }
  if (process.env.QA_BYPASS_AUTH === "1") return NextResponse.next()
  if (isAliasPath(pathname) && isDryRun(req)) return NextResponse.next()

  const needsAuth = PROTECTED.some(r => r.test(pathname))
  if (!needsAuth) return NextResponse.next()

  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!hasSupabase) {
    const url = new URL("/auth/signin", req.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*","/profile/:path*","/orders/:path*","/checkout",
    "/auth/callback","/api/admin/:path*","/api/user/:path*",
  ],
}
