import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"
import { USE_SUPABASE } from "@/lib/runtime"

export function createClient() {
  if (!USE_SUPABASE) {
    return {
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        insert: async () => ({ data: null, error: null }),
        update: () => ({ eq: async () => ({ data: null, error: null }) }),
        delete: () => ({ eq: async () => ({ data: null, error: null }) }),
      }),
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
    } as any
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!
  return createBrowserClient<Database>(url, anon)
}

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createClient()
