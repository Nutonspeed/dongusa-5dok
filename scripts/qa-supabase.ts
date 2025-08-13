// scripts/qa-supabase.ts
// Run with: pnpm exec tsx scripts/qa-supabase.ts --verbose
import { spawn } from "node:child_process";
import http from "node:http";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const VERBOSE = process.argv.includes("--verbose");
const log = (...a: any[]) => VERBOSE && console.log(...a);
const pass = (m: string) => console.log(`✅ ${m}`);
const fail = (m: string, e?: any) => { console.error(`❌ ${m}`, e?.message || e || ""); process.exitCode = 1; };

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }
async function waitForOk(url: string, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch {}
    await wait(500);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function ensureServer(): Promise<null | { kill: () => void }> {
  // quick check
  try {
    const res = await fetch(`${BASE}/api/health`);
    if (res.ok) { log("Server already running"); return null; }
  } catch {}
  // start server
  log("Starting server: pnpm start");
  const child = spawn("pnpm", ["start"], { stdio: VERBOSE ? "inherit" : "ignore", shell: true });
  try {
    await waitForOk(`${BASE}/api/health`, 60000);
    pass("Server started");
    return { kill: () => { try { child.kill("SIGTERM"); } catch {} } };
  } catch (e) {
    fail("Server failed to start", e);
    return null;
  }
}

async function run() {
  // Preconditions
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (process.env.QA_BYPASS_AUTH === "1") {
    throw new Error("QA_BYPASS_AUTH must be 0 for real Supabase QA");
  }

  const server = await ensureServer();

  try {
    // 1) Health
    const h = await fetch(`${BASE}/api/health`);
    const hJson = await h.json().catch(() => ({}));
    if (!h.ok) throw new Error(`/api/health status ${h.status}`);
    log("health:", hJson);
    if (hJson.bypass !== false || hJson.mock !== false) {
      console.warn("⚠️ health flags unexpected for real Supabase:", hJson);
    }
    pass("GET /api/health");

    // 2) Admin page (should render with real mode)
    const a = await fetch(`${BASE}/admin`, { redirect: "manual" });
    if (!a.ok) throw new Error(`/admin status ${a.status}`);
    const aText = await a.text();
    if (!aText || aText.length < 100) console.warn("⚠️ /admin HTML looks short");
    pass("GET /admin");

    // 3) CSV export (text/csv expected)
    const c = await fetch(`${BASE}/api/admin/orders/bulk-export`);
    if (!c.ok) throw new Error(`/api/admin/orders/bulk-export status ${c.status}`);
    const cType = c.headers.get("content-type") || "";
    if (!cType.includes("text/csv")) console.warn("⚠️ CSV content-type:", cType);
    const cBody = await c.text();
    if (!cBody.includes(",")) console.warn("⚠️ CSV body may be empty");
    pass("GET /api/admin/orders/bulk-export");

    // 4) Create bill (POST /api/bills)
    const payload = {
      customer: { name: "QA User", phone: "0999999999" },
      items: [{ sku: "QA-001", name: "QA Fabric", qty: 1, price: 1234.56 }],
      shipping: 0, discount: 0, notes: "QA Supabase bill"
    };
    const b = await fetch(`${BASE}/api/bills`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const bText = await b.text();
    if (!(b.status === 200 || b.status === 201)) throw new Error(`/api/bills status ${b.status} body ${bText.slice(0,180)}`);
    // Try to parse id field if any
    try {
      const bJson = JSON.parse(bText);
      if (!bJson.id) console.warn("⚠️ /api/bills responded without id:", bJson);
    } catch {
      console.warn("⚠️ /api/bills non-JSON response");
    }
    pass("POST /api/bills");

    console.log("SMOKE_SUPABASE: PASS");
  } catch (e) {
    fail("SMOKE_SUPABASE: FAIL", e);
  } finally {
    if (server) server.kill();
  }
}

run().catch(e => fail("SMOKE_SUPABASE crashed", e));
