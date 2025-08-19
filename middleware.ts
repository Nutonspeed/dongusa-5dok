import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { USE_SUPABASE } from "@/lib/runtime"

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

const PROTECTED_ROUTES = {
  admin: ["/admin", "/api/admin"],
  user: ["/profile", "/orders", "/checkout", "/api/user"],
  public: ["/auth/callback"],
}

function getClientIP(request: NextRequest): string {
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

async function handleSessionAuth(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCheck = requiresAuth(pathname)

  if (!authCheck.required) {
    return NextResponse.next()
  }

  try {
    const { sessionManager } = await import("@/lib/session-management").catch(() => ({ sessionManager: null }))

    if (!sessionManager) {
      console.warn("Session manager not available, falling back to basic auth")
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const sessionId = request.cookies.get("session_id")?.value
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get("user-agent") || ""

    if (!sessionId) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const validation = await sessionManager.validateSession(sessionId, clientIP, userAgent)

    if (!validation.isValid) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url))
      response.cookies.delete("session_id")
      return response
    }

    // Check role-based access
    if (authCheck.role === "admin" && validation.session?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Handle session refresh
    if (validation.shouldRefresh) {
      await sessionManager.refreshSession(sessionId)
    }

    // Add security warnings to response headers for client-side handling
    const response = NextResponse.next()
    if (validation.securityWarnings.length > 0) {
      response.headers.set("X-Security-Warnings", JSON.stringify(validation.securityWarnings))
    }

    if (validation.requiresReauth) {
      response.headers.set("X-Requires-Reauth", "true")
    }

    return response
  } catch (error) {
    console.error("Session validation error:", error)
    const response = NextResponse.redirect(new URL("/auth/login", request.url))
    response.cookies.delete("session_id")
    return response
  }
}

async function handleSupabaseAuth(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!url || !anon) {
      console.error("Missing Supabase environment variables")
      const authCheck = requiresAuth(pathname)
      if (authCheck.required) {
        const loginUrl = new URL("/auth/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.next()
    }

    const { createServerClient } = await import("@supabase/ssr").catch(() => ({ createServerClient: null }))

    if (!createServerClient) {
      console.warn("Supabase SSR not available, falling back to basic auth")
      const authCheck = requiresAuth(pathname)
      if (authCheck.required) {
        const loginUrl = new URL("/auth/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.next()
    }

    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    // Handle auth callback
    const code = request.nextUrl.searchParams.get("code")
    if (code && pathname === "/auth/callback") {
      try {
        await supabase.auth.exchangeCodeForSession(code)
        return NextResponse.redirect(new URL("/", request.url))
      } catch (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(new URL("/auth/login?error=callback_failed", request.url))
      }
    }

    // Refresh session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
    }

    const authCheck = requiresAuth(pathname)

    if (!authCheck.required) {
      return supabaseResponse
    }

    // Check if user is authenticated
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check role-based access for protected routes
    if (authCheck.role) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          console.error("Profile fetch error:", profileError)
          if (authCheck.role === "admin") {
            return NextResponse.redirect(new URL("/auth/login?error=profile_access", request.url))
          }
          return supabaseResponse
        }

        const userRole = profile?.role

        // Check admin access
        if (authCheck.role === "admin" && userRole !== "admin") {
          return NextResponse.redirect(new URL("/?error=insufficient_permissions", request.url))
        }
      } catch (error) {
        console.error("Role check error:", error)
        if (authCheck.role === "admin") {
          return NextResponse.redirect(new URL("/auth/login?error=role_check_failed", request.url))
        }
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error("Supabase middleware error:", error)
    const authCheck = requiresAuth(pathname)
    if (authCheck.required) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("error", "middleware_error")
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }
}

export default async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Handle maintenance mode
    if (process.env.MAINTENANCE === "1") {
      return NextResponse.rewrite(new URL("/maintenance", request.url))
    }

    // Skip middleware for static files and API routes (except protected ones)
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.includes(".") ||
      (pathname.startsWith("/api") && !pathname.startsWith("/api/admin") && !pathname.startsWith("/api/user"))
    ) {
      return NextResponse.next()
    }

    // QA bypass mode - skip all authentication
    if (process.env.QA_BYPASS_AUTH === "1") {
      return NextResponse.next()
    }

    let useSupabase = false
    try {
      useSupabase = USE_SUPABASE
    } catch (error) {
      console.warn("Runtime configuration not available, defaulting to Supabase auth")
      useSupabase = true
    }

    // Route to appropriate auth handler
    if (useSupabase) {
      return await handleSupabaseAuth(request)
    } else {
      return await handleSessionAuth(request)
    }
  } catch (error) {
    console.error("Critical middleware error:", error)
    return NextResponse.next()
  }
}
