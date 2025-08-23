import { createServerClient } from "@supabase/ssr"

// Create a server Supabase client. Avoid top-level import of `next/headers`
// so this module can be imported safely in non-ServerComponent build contexts.
export async function createClient() {
  // Attempt to dynamically import next/headers only at runtime. If it's
  // unavailable (e.g., during certain build steps or non-server contexts),
  // fall back to a no-op cookie store.
  let cookieStore: any = null
  try {
    const headers = await import("next/headers")
    if (typeof headers?.cookies === "function") {
      cookieStore = await headers.cookies()
    }
  } catch (err) {
    // ignore - runtime doesn't provide next/headers
    cookieStore = null
  }

  const cookieAdapter = cookieStore
    ? {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options))
          } catch {
            // When called from a Server Component that doesn't support setting cookies
            // (or during build), ignore silently.
          }
        },
      }
    : undefined

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    ...(cookieAdapter ? { cookies: cookieAdapter } : {}),
  })
}

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
