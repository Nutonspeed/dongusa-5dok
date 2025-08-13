import { logger } from '@/lib/logger';
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"
import { cookies } from "next/headers"
// @ts-expect-error react cache is experimental
import { cache } from "react"
import { USE_SUPABASE } from "@/lib/runtime"

export const createClient = cache(() => {
  if (!USE_SUPABASE) {
    logger.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: (_table: string) => ({
        select: () => ({
          eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
          order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      }),
    } as any
  }

  try {
    const cookieStore = cookies()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
    const anon =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY!
    return createServerClient<Database>(url, anon, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })
  } catch (error) {
    logger.warn("Failed to create server client, falling back to dummy client:", error)
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: (_table: string) => ({
        select: () => ({
          eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
          order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      }),
    } as any
  }
})
