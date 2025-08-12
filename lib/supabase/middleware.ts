import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured) {
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
    const isAuthRoute =
      request.nextUrl.pathname.startsWith("/auth/") ||
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register")

    // For admin routes, check for demo token
    if (isAdminRoute && !isAuthRoute) {
      const adminToken = request.cookies.get("admin_token")?.value
      if (!adminToken) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }
    }

    return NextResponse.next()
  }

  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req: request, res })

    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(new URL("/", request.url))
    }

    await supabase.auth.getSession()

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
    const isAuthRoute = request.nextUrl.pathname.startsWith("/auth/")

    if (isAdminRoute && !isAuthRoute) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}
