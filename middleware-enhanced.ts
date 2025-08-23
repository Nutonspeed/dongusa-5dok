// Enhanced Middleware with comprehensive authentication and authorization
// Handles both Supabase and mock authentication modes

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase"
// ...existing code...
import { USE_SUPABASE } from "@/lib/runtime"
import { logger } from "@/lib/logger"

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/orders/:path*", "/checkout", "/auth/callback"],
}

const PROTECTED_ROUTES = {
  admin: ["/admin"],
  staff: ["/admin/orders", "/admin/customers", "/admin/products"],
  customer: ["/profile", "/orders", "/checkout"],
  public: ["/auth/callback"],
}

function requiresAuth(pathname: string): { required: boolean; role?: string } {
  if (PROTECTED_ROUTES.public.some((route) => pathname.startsWith(route))) {
    return { required: false }
  }

  if (PROTECTED_ROUTES.admin.some((route) => pathname.startsWith(route))) {
    return { required: true, role: "admin" }
  }

  if (PROTECTED_ROUTES.staff.some((route) => pathname.startsWith(route))) {
    return { required: true, role: "staff" }
  }

  if (PROTECTED_ROUTES.customer.some((route) => pathname.startsWith(route))) {
    return { required: true, role: "customer" }
  }

  return { required: false }
}

async function handleMockAuth(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCheck = requiresAuth(pathname)

  if (!authCheck.required) {
    return NextResponse.next()
  }

  // Check for mock authentication
  const authUser = request.cookies.get("auth_user")?.value
  const adminToken = request.cookies.get("admin_token")?.value

  if (!authUser) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const user = JSON.parse(authUser)

    // Check role-based access
    if (authCheck.role === "admin" && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (authCheck.role === "staff" && !["admin", "staff"].includes(user.role)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // For admin routes, also check admin token
    if (pathname.startsWith("/admin") && !adminToken) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  } catch (error) {
    logger.error("Mock auth parsing error:", error)
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }
}

async function handleSupabaseAuth(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {

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
    if (supabase && typeof (supabase as any).setCookieAdapter === "function") {
      (supabase as any).setCookieAdapter?.(cookieAdapter)
    }

    // Handle auth callback
    const code = request.nextUrl.searchParams.get("code")
    if (code && pathname === "/auth/callback") {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Refresh session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      logger.error("Session error:", sessionError)
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
          logger.error("Profile fetch error:", profileError)
          // Allow access if profile check fails (graceful degradation)
          return supabaseResponse
        }

        const userRole = profile?.role

        // Check admin access
        if (authCheck.role === "admin" && userRole !== "admin") {
          return NextResponse.redirect(new URL("/", request.url))
        }

        // Check staff access
        if (authCheck.role === "staff" && !["admin", "staff"].includes(userRole)) {
          return NextResponse.redirect(new URL("/", request.url))
        }
      } catch (error) {
        logger.error("Role check error:", error)
        // Allow access if role check fails (graceful degradation)
      }
    }

    return supabaseResponse
  } catch (error) {
    logger.error("Supabase middleware error:", error)
    return NextResponse.next()
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle maintenance mode
  if (process.env.MAINTENANCE === "1") {
    return NextResponse.rewrite(new URL("/maintenance", request.url))
  }

  // Skip middleware for static files and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next()
  }

  // QA bypass mode - skip all authentication
  if (process.env.QA_BYPASS_AUTH === "1") {
    return NextResponse.next()
  }

  // Route to appropriate auth handler
  if (USE_SUPABASE) {
    return handleSupabaseAuth(request)
  } else {
    return handleMockAuth(request)
  }
}
