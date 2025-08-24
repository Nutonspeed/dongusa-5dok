import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  // Check if we're in a server environment that supports cookies
  if (typeof window !== "undefined") {
    // Client-side fallback - use client supabase
    const { createClient } = await import("./client")
    return createClient()
  }

  try {
    const cookieStore = await cookies()

    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })
  } catch (error) {
    // Fallback to client if server context is not available
    const { createClient } = await import("./client")
    return createClient()
  }
}

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
