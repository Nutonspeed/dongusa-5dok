import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Ensures the requester is an administrator.
 * Allows bypass with QA_BYPASS_AUTH=1.
 * Checks role from headers, Supabase SSR session (profiles.role), or user metadata.
 * Throws a 401/403 Response on failure.
 */
export async function requireAdmin(request: NextRequest): Promise<void> {
  if (process.env.QA_BYPASS_AUTH === "1") return

  const headerRole = request.headers.get("x-role") || request.headers.get("x-user-role")
  if (headerRole === "admin") return

  // Try via Supabase SSR with cookies (same approach as middleware)
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    if (url && anon) {
      const { createServerClient } = await import("@supabase/ssr")
      const supabaseSSR = createServerClient(url, anon, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          // In API route we don't need to set cookies on response here
          setAll: () => {},
        },
      })

      const {
        data: { session },
      } = await supabaseSSR.auth.getSession()

      if (session) {
        const { data: profile } = await supabaseSSR
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
        if (profile?.role === "admin") return
      }
    }
  } catch {
    // ignore and fallback
  }

  // Fallback: attempt server client (may not have cookie context)
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const role = (user?.user_metadata as any)?.role || (user?.app_metadata as any)?.role
    if (role === "admin") return
    throw new Response("Forbidden", { status: user ? 403 : 401 })
  } catch {
    throw new Response("Unauthorized", { status: 401 })
  }
}
