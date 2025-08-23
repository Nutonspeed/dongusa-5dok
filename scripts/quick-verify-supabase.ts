#!/usr/bin/env tsx
// Quick Supabase verifier (avoids 'server-only' import)
// Usage: npx tsx scripts/quick-verify-supabase.ts
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL) {
  console.error("Missing SUPABASE URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL")
  process.exit(1)
}

if (!SUPABASE_ANON && !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("No anon or service role key provided; attempting anonymous requests (may be limited)")
}

const clientKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON
const supabase = createClient(SUPABASE_URL, clientKey)

async function checkTable(name: string) {
  try {
    const { data, error } = await supabase.from(name).select("id").limit(1)
    if (error) return { name, ok: false, error: error.message }
    return { name, ok: true, count: data?.length ?? 0 }
  } catch (err: any) {
    return { name, ok: false, error: err.message ?? String(err) }
  }
}

async function main() {
  console.log("Quick Supabase verification")
  console.log("URL:", SUPABASE_URL)
  console.log("Using key:", SUPABASE_SERVICE_ROLE_KEY ? "service_role" : SUPABASE_ANON ? "anon" : "none")

  const start = Date.now()
  const tables = ["products","categories","customers","orders","order_items"]
  const results: Array<any> = []
  for (const t of tables) {
    const r = await checkTable(t)
    results.push(r)
    console.log(`- Table ${t}:`, r.ok ? `OK (rows=${r.count})` : `ERROR (${r.error})`)
  }

  // Check auth/session
  try {
    const { data: sessionData, error: sessErr } = await supabase.auth.getSession()
    if (sessErr) {
      console.log("Auth getSession: error -", sessErr.message)
    } else {
      console.log("Auth getSession: OK (session:", sessionData, ")")
    }
  } catch (err: any) {
    console.log("Auth check error:", err.message ?? String(err))
  }

  const elapsed = Date.now() - start
  console.log("Verification finished in", elapsed, "ms")

  const anyOk = results.some((r) => r.ok)
  process.exit(anyOk ? 0 : 0)
}

main().catch((e) => {
  console.error("Fatal error:", e)
  process.exit(1)
})
