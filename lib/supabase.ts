import { createClient as createBrowserClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Lightweight mock used across the project when real DB access must be disabled.
function makeMockSupabase(): SupabaseClient<any> {
  const noop = async () => ({ data: null, error: null })
  const query = () => ({ select: noop, insert: noop, update: noop, delete: noop, eq: () => query(), single: noop, range: noop, limit: noop, order: () => query(), rpc: noop })
  return {
    from: () => query() as any,
    rpc: noop as any,
    auth: { getUser: async () => ({ data: null, error: null }), signIn: async () => ({ data: null, error: null }) } as any,
    // Basic helpers to satisfy common code paths
    channel: () => ({ on: () => ({ subscribe: async () => ({ data: null, error: null }) }) }),
    // ...other fields are intentionally left out and will be typed as any
  } as unknown as SupabaseClient<any>
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const FORCE_MOCK = !!process.env.FORCE_MOCK_SUPABASE || process.env.NODE_ENV === "test"

export const supabase: SupabaseClient<any> = !FORCE_MOCK && supabaseUrl && supabaseAnonKey
  ? createBrowserClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : makeMockSupabase()

// Export createServerClient for server contexts dynamically from server module when needed.
export async function createServerClient(): Promise<SupabaseClient<any>> {
  // If tests or a forced mock are requested, return the mock immediately.
  if (FORCE_MOCK) return makeMockSupabase()

  // dynamic import avoids pulling server-only code into client/build time
  const mod = await import("./supabase/server")
  return mod.createClient() as Promise<SupabaseClient<any>>
}

export const isSupabaseConfigured = !FORCE_MOCK && !!supabaseUrl && !!supabaseAnonKey
