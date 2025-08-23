import { createBrowserClient } from "@supabase/ssr"

// Lightweight mock used when DB access must be disabled.
function makeMockSupabase() {
  const noop = () => ({ data: null, error: null })
  return {
    from: () => ({ select: noop, insert: noop, update: noop, delete: noop, eq: noop, single: noop, range: noop, limit: noop, order: noop, rpc: noop }),
    rpc: noop,
    auth: { getUser: async () => null, signIn: async () => ({ data: null, error: null }) },
  } as any
}

const FORCE_MOCK = !!process.env.FORCE_MOCK_SUPABASE || process.env.NODE_ENV === "test"

export function createClient(supabaseUrl?: string, supabaseAnonKey?: string) {
  if (FORCE_MOCK) return makeMockSupabase()

  const url = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = supabaseAnonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !key) return makeMockSupabase()

  return createBrowserClient(url, key)
}

export const supabase = createClient()
