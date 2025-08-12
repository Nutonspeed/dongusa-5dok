import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cache } from "react"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export const createClient = cache(() => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: (table: string) => ({
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
    // Only import cookies when actually needed in server context
    const { cookies } = require("next/headers")
    const cookieStore = cookies()
    return createServerComponentClient({ cookies: () => cookieStore })
  } catch (error) {
    console.warn("Failed to create server client, falling back to dummy client:", error)
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: (table: string) => ({
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
