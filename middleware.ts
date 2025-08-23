import { createServerClient } from "@/lib/supabase"
import { decidePostAuthRedirect } from "@/lib/auth/redirect"
import { featureFlags } from "@/utils/featureFlags"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

const PROTECTED_ROUTES = {
  admin: ["/admin", "/api/admin"],
  user: ["/profile", "/orders", "/checkout", "/api/user"],
  public: ["/auth/callback", "/auth/login", "/login"],
}

function _getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  )
}

function requiresAuth(pathname: string): { required: boolean; role?: string } {
  if (PROTECTED_ROUTES.public.some((route) => pathname.startsWith(route))) {
    return { required: false }
  }

  if (PROTECTED_ROUTES.admin.some((route) => pathname.startsWith(route))) {
    return { required: true, role: "admin" }
  }

  if (PROTECTED_ROUTES.user.some((route) => pathname.startsWith(route))) {
    return { required: true, role: "user" }
  }

  return { required: false }
}

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const cookieAdapter = {
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet: any[]) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      supabaseResponse = NextResponse.next({
        request,
      })
      cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
    },
  }

  const supabase = await createServerClient()
  // If the returned client supports configuring cookies (real client), pass cookie adapter if available
  if (supabase && typeof (supabase as any).setCookieAdapter === "function") {
    (supabase as any).setCookieAdapter?.(cookieAdapter)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const authCheck = requiresAuth(pathname)

  // Handle auth callback
  const code = request.nextUrl.searchParams.get("code")
  if (code && pathname === "/auth/callback") {
    try {
      await supabase.auth.exchangeCodeForSession(code)
      const redirectParam = request.nextUrl.searchParams.get("redirect")

      const {
        data: { session: postSession },
      } = await supabase.auth.getSession()

      let role: "admin" | "customer" | "staff" | null | undefined = null
      if (postSession) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", postSession.user.id)
            .single()
          role = (profile?.role as any) || null
        } catch {
          // ignore role fetch error; role remains null
        }
      }

      const dest = decidePostAuthRedirect(role, redirectParam || undefined)
      const res = NextResponse.redirect(new URL(dest, request.url))
      res.headers.set("Cache-Control", "no-store")
      return res
    } catch (error) {
      console.error("Auth callback error:", error)
      const res = NextResponse.redirect(new URL("/auth/login?error=callback_failed", request.url))
      res.headers.set("Cache-Control", "no-store")
      return res
    }
  }

  if (authCheck.required && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Handle authenticated user on login page
  if (pathname === "/auth/login" && user) {
    const redirectParam = request.nextUrl.searchParams.get("redirect")
    let role: "admin" | "customer" | "staff" | null | undefined = null
    try {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      role = (profile?.role as any) || null
    } catch {
      // ignore and fall through
    }
    const dest = decidePostAuthRedirect(role, redirectParam || undefined)
    const res = NextResponse.redirect(new URL(dest, request.url))
    res.headers.set("Cache-Control", "no-store")
    return res
  }

  if (authCheck.role === "admin" && user) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError || profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/?error=insufficient_permissions", request.url))
      }
    } catch (error) {
      console.error("Role check error:", error)
      return NextResponse.redirect(new URL("/auth/login?error=role_check_failed", request.url))
    }
  }

  return supabaseResponse
}

export default async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Handle maintenance mode
    if (featureFlags.MAINTENANCE) {
      return NextResponse.rewrite(new URL("/maintenance", request.url))
    }

    // Skip middleware for static files
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.includes(".") ||
      (pathname.startsWith("/api") && !pathname.startsWith("/api/admin") && !pathname.startsWith("/api/user"))
    ) {
      return NextResponse.next()
    }

    // QA bypass mode - skip all authentication
    if (featureFlags.QA_BYPASS_AUTH) {
      return NextResponse.next()
    }

    return await updateSession(request)
  } catch (error) {
    console.error("Critical middleware error:", error)
    return NextResponse.next()
  }
}
