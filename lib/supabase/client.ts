import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Lightweight mock used when DB access must be disabled.
function makeMockSupabase(): SupabaseClient<any> {
  const noop = async () => ({ data: null, error: null })
  const query = () => ({ select: noop, insert: noop, update: noop, delete: noop, eq: () => query(), single: noop, range: noop, limit: noop, order: () => query(), rpc: noop })
  return {
    from: () => query() as any,
    rpc: noop as any,
    auth: { getUser: async () => ({ data: null, error: null }), signIn: async () => ({ data: null, error: null }) } as any,
    channel: () => ({ on: () => ({ subscribe: async () => ({ data: null, error: null }) }) }),
  } as unknown as SupabaseClient<any>
}

const FORCE_MOCK = !!process.env.FORCE_MOCK_SUPABASE || process.env.NODE_ENV === "test"

export function createClient(supabaseUrl?: string, supabaseAnonKey?: string) {
  if (FORCE_MOCK) return makeMockSupabase()

  const url = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = supabaseAnonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !key) return makeMockSupabase()

  return createBrowserClient(url, key)
}

export const supabase: SupabaseClient<any> = createClient()
