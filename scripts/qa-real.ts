// E2E QA hitting REAL deployment (or preview) using seeded IDs.
// Requires BASE_URL. For admin pages that need auth, run with QA_BYPASS_AUTH=1 on preview.
// It will check: /api/health, /admin/orders, bill/view + timeline for seeded bills.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const BASE_URL = process.env.BASE_URL!;
if (!BASE_URL) {
  console.error("Missing BASE_URL");
  process.exit(1);
}

// Load seeded ids
let ids: { orders: string[]; bills: string[] } = { orders: [], bills: [] };
try {
  const raw = readFileSync(resolve("tmp/seed-output.json"), "utf8");
  const j = JSON.parse(raw);
  ids.orders = j.orders || [];
  ids.bills = j.bills || [];
} catch {
  console.warn("⚠️ tmp/seed-output.json not found; continuing with health/admin only.");
}

type Check = { path: string; expect: (s: number) => boolean; note?: string };

const fixedChecks: Check[] = [
  { path: "/api/health", expect: (s) => s >= 200 && s < 400, note: "health" },
  { path: "/admin/orders", expect: (s) => s >= 200 && s < 400, note: "admin orders (may need QA_BYPASS_AUTH=1 on preview)" },
];

function billChecks(): Check[] {
  return ids.bills.flatMap((bid) => ([
    { path: `/bill/view/${bid}`, expect: (s) => s >= 200 && s < 400, note: `bill view ${bid}` },
    { path: `/bill/timeline/${bid}`, expect: (s) => s >= 200 && s < 400, note: `bill timeline ${bid}` },
  ]));
}

async function hit(path: string) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { redirect: "manual" });
  return { status: res.status, url };
}

(async () => {
  console.log("🔎 QA REAL against:", BASE_URL);
  const checks = [...fixedChecks, ...billChecks()];
  let okAll = true;

  for (const c of checks) {
    await delay(50);
    try {
      const { status, url } = await hit(c.path);
      const ok = c.expect(status);
      console.log(`${ok ? "✅" : "❌"} ${status} — ${url}${c.note ? "  // " + c.note : ""}`);
      if (!ok) okAll = false;
    } catch (e) {
      console.log(`❌ ERR — ${c.path} (${String(e)})`);
      okAll = false;
    }
  }

  process.exit(okAll ? 0 : 1);
})();

