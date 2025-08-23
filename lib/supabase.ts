import { createClient as createBrowserClient } from "@supabase/supabase-js"

// Lightweight mock used across the project when real DB access must be disabled.
function makeMockSupabase() {
  const noop = () => ({ data: null, error: null })
  return {
    from: () => ({ select: noop, insert: noop, update: noop, delete: noop, eq: noop, single: noop, range: noop, limit: noop, order: noop, rpc: noop }),
    rpc: noop,
    auth: { getUser: async () => null, signIn: async () => ({ data: null, error: null }) },
  } as any
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const FORCE_MOCK = !!process.env.FORCE_MOCK_SUPABASE || process.env.NODE_ENV === "test"

export const supabase = !FORCE_MOCK && supabaseUrl && supabaseAnonKey
  ? createBrowserClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : makeMockSupabase()

// Export createServerClient for server contexts dynamically from server module when needed.
export async function createServerClient() {
  // If tests or a forced mock are requested, return the mock immediately.
  if (FORCE_MOCK) return makeMockSupabase()

  // dynamic import avoids pulling server-only code into client/build time
  const mod = await import("./supabase/server")
  return mod.createClient()
}

export const isSupabaseConfigured = !FORCE_MOCK && !!supabaseUrl && !!supabaseAnonKey
