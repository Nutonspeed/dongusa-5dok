// scripts/health-check.mjs
// Node 18+ (fetch/AbortController built-in). Cross-platform (no jq required).
// Usage:
//   node scripts/health-check.mjs
//   NEXT_PUBLIC_SITE_URL=https://www.mystore.co.th node scripts/health-check.mjs

const DEFAULT_BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

const endpoints = [
  { name: "root", path: "/api/health" },
  { name: "supabase", path: "/api/health/supabase" },
  { name: "database", path: "/api/health/database" },
  { name: "payment", path: "/api/health/payment" },
  { name: "storage", path: "/api/health/storage" },
  { name: "page:/health", path: "/health" },
]

function pad(str, len) {
  const s = String(str ?? "")
  return s.length >= len ? s.slice(0, len) : s + " ".repeat(len - s.length)
}

async function fetchJson(url, timeoutMs = 8000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal })
    let json = null
    try {
      json = await res.json()
    } catch {
      // Not JSON, keep as text
      const text = await res.text().catch(() => "")
      json = { text }
    }
    return { ok: res.ok, status: res.status, data: json }
  } catch (e) {
    return { ok: false, status: 0, data: { error: String(e && e.message ? e.message : e) } }
  } finally {
    clearTimeout(t)
  }
}

function classify(name, res) {
  if (!res) return "error"
  // Page /health returns 200, API returns status field
  if (name.startsWith("page:")) return res.ok ? "ok" : "error"
  const s = res.data && res.data.status
  if (s === "ok") return "ok"
  if (s === "degraded") return "degraded"
  return res.ok ? "ok" : "error"
}

async function main() {
  const base = DEFAULT_BASE.replace(/\/+$/, "")
  console.log(`\n🔍 Health Check: ${base}\n`)
  console.log(`${pad("Endpoint", 26)} | ${pad("HTTP", 5)} | Status      | Notes`)
  console.log("-".repeat(70))

  let failures = 0

  for (const ep of endpoints) {
    const url = `${base}${ep.path}`
    const res = await fetchJson(url)
    const state = classify(ep.name, res)
    const http = res.status || "-"
    const note =
      state === "ok"
        ? "OK"
        : state === "degraded"
          ? "Degraded"
          : res && res.data && (res.data.error || res.data.text)
            ? String(res.data.error || res.data.text).slice(0, 90)
            : "Error"
    if (state !== "ok") failures++
    console.log(`${pad(`${ep.name} (${ep.path})`, 26)} | ${pad(http, 5)} | ${pad(state, 10)} | ${note}`)
  }

  console.log("\nSummary:", failures === 0 ? "✅ All good" : `⚠️ ${failures} endpoint(s) need attention`)
  if (failures > 0) {
    console.log("- Check environment variables (Supabase/Stripe/Blob/Redis)")
    console.log("- See /health page and the yellow banner for live status/response times")
  }
}

main().catch((e) => {
  console.error("Health check failed:", e)
  process.exit(1)
})
