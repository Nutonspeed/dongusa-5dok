import { decidePostAuthRedirect } from "@/lib/auth/redirect"
import { featureFlags } from "@/utils/featureFlags"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/checkout",
    "/auth/callback",
    "/auth/login",
    "/login",
    "/api/admin/:path*",
    "/api/user/:path*",
  ],
}

const PROTECTED_ROUTES = {
  admin: ["/admin", "/api/admin"],
  user: ["/profile", "/orders", "/checkout", "/api/user"],
  public: ["/auth/callback", "/auth/login", "/login"],
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
        const res = NextResponse.redirect(loginUrl)
        res.headers.set("Cache-Control", "no-store")
        return res
      }
      // For non-protected routes, optionally rewrite to a friendly offline page if features are disabled or DB not configured
      if (featureFlags.DISABLE_UNREADY_FEATURES || !featureFlags.IS_SUPABASE_CONFIGURED) {
        const offlineUrl = new URL("/offline", request.url)
        const res = NextResponse.rewrite(offlineUrl)
        res.headers.set("Cache-Control", "no-store")
        return res
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
        const redirectParam = request.nextUrl.searchParams.get("redirect")
        // Fetch session and role to decide landing deterministically
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
      // If user opens /auth/login while already authenticated, route them smartly (role-first with safe returnUrl)
      if (pathname === "/auth/login" && session) {
        const redirectParam = request.nextUrl.searchParams.get("redirect")
        let role: "admin" | "customer" | "staff" | null | undefined = null
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
          role = (profile?.role as any) || null
        } catch {
          // ignore and fall through
        }
        const dest = decidePostAuthRedirect(role, redirectParam || undefined)
        const res = NextResponse.redirect(new URL(dest, request.url))
        res.headers.set("Cache-Control", "no-store")
        return res
      }
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

        const userRole = profile?.role as string | null | undefined

        // Check admin access strictly based on role from profiles
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
    if (featureFlags.MAINTENANCE) {
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
    if (featureFlags.QA_BYPASS_AUTH) {
      return NextResponse.next()
    }

    // Always use Supabase auth on Edge to avoid Node APIs
    return await handleSupabaseAuth(request)
  } catch (error) {
    console.error("Critical middleware error:", error)
    return NextResponse.next()
  }
}
