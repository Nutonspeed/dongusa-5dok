import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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
        // Determine where to go next: redirect param > role-based > home
        const redirectParam = request.nextUrl.searchParams.get("redirect")
        if (redirectParam) {
          return NextResponse.redirect(new URL(redirectParam, request.url))
        }

        // Fetch session and role to decide default landing
        const {
          data: { session: postSession },
        } = await supabase.auth.getSession()

        if (postSession) {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", postSession.user.id)
              .single()

            if (profile?.role === "admin") {
              return NextResponse.redirect(new URL("/admin", request.url))
            }
          } catch {
            // ignore role fetch error and fall through
          }
        }

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
      if (pathname === "/auth/login" && session) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, email")
            .eq("id", session.user.id)
            .single()

          console.log("[v0] User profile for redirect:", profile)
          console.log("[v0] Session email:", session.user.email)

          const isAdmin =
            profile?.role === "admin" ||
            profile?.email === "nuttapong161@gmail.com" ||
            session.user.email === "nuttapong161@gmail.com"

          if (isAdmin) {
            console.log("[v0] Redirecting admin user to /admin dashboard")
            return NextResponse.redirect(new URL("/admin", request.url))
          }
        } catch (error) {
          console.error("[v0] Profile fetch error during login redirect:", error)
          // ignore and fall through
        }
        return NextResponse.redirect(new URL("/", request.url))
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
          .select("role, email")
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
        const userEmail = profile?.email
        const sessionEmail = session.user.email

        if (authCheck.role === "admin") {
          const isAdmin =
            userRole === "admin" || userEmail === "nuttapong161@gmail.com" || sessionEmail === "nuttapong161@gmail.com"

          if (!isAdmin) {
            console.log("[v0] Access denied - user is not admin:", { userRole, userEmail, sessionEmail })
            return NextResponse.redirect(new URL("/?error=insufficient_permissions", request.url))
          }
          console.log("[v0] Admin access granted:", { userRole, userEmail, sessionEmail })
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

    // Always use Supabase auth on Edge to avoid Node APIs
    return await handleSupabaseAuth(request)
  } catch (error) {
    console.error("Critical middleware error:", error)
    return NextResponse.next()
  }
}
