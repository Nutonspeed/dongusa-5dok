import "server-only"
import { cookies } from "next/headers"

export async function getUserSafe() {
  if (process.env.QA_BYPASS_AUTH === "1") return { user: { id: "qa-bypass" } }

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return { user: null } // ไม่มี env → ไม่ throw

  try {
    const { createServerClient } = await import("@supabase/ssr")
    const supabase = createServerClient(url, anon, {
      cookies: {
        get: (n: string) => cookies().get(n)?.value,
        set() { /* noop */ }, remove() { /* noop */ },
      },
    })
    const { data: { user } } = await supabase.auth.getUser()
    return { user }
  } catch {
    return { user: null }
  }
}

export async function requireAdminSafe() {
  const { user } = await getUserSafe()
  return !!user || process.env.QA_BYPASS_AUTH === "1"
}
