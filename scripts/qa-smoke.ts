import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { spawn } from "child_process";

const BASE = "http://localhost:3000";

async function isUp() {
  try {
    const res = await fetch(`${BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForServer(timeout = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await isUp()) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not start");
}

async function run() {
  process.env.QA_BYPASS_AUTH = "1";

  let child: any = null;
  let started = false;
  if (!(await isUp())) {
    child = spawn("pnpm", ["start"], {
      env: { ...process.env, QA_BYPASS_AUTH: "1" },
      stdio: "inherit",
      detached: true,
    });
    started = true;
  }

  try {
    await waitForServer();

    let ok = true;
    let billId = "";

    async function check(label: string, fn: () => Promise<void>) {
      try {
        await fn();
        console.log(`✅ ${label}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`❌ ${label}: ${msg}`);
        ok = false;
      }
    }

    await check("GET /", async () => {
      const res = await fetch(`${BASE}/`);
      if (res.status !== 200) throw new Error(`status ${res.status}`);
    });

    let health: any = null;
    await check("GET /api/health", async () => {
      const res = await fetch(`${BASE}/api/health`);
      if (res.status !== 200) throw new Error(`status ${res.status}`);
      health = await res.json();
      console.log("/api/health", { bypass: health.bypass, mock: health.mock });
    });

    await check("GET /admin", async () => {
      const res = await fetch(`${BASE}/admin`);
      if (res.status !== 200) {
        throw new Error(`/admin failed while health says bypass=${health?.bypass} mock=${health?.mock} status ${res.status}`);
      }
    });

    await check("POST /api/bills", async () => {
      const res = await fetch(`${BASE}/api/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{}] }),
      });
      if (res.status !== 201) throw new Error(`status ${res.status}`);
      const data = await res.json();
      billId = data.id;
      if (!billId) throw new Error("missing id");
    });

    await check("GET /bill/view/{id}", async () => {
      const res = await fetch(`${BASE}/bill/view/${billId}`);
      if (res.status !== 200) throw new Error(`status ${res.status}`);
    });

    await check("GET /api/admin/orders/bulk-export", async () => {
      const res = await fetch(`${BASE}/api/admin/orders/bulk-export`);
      if (res.status !== 200) throw new Error(`status ${res.status}`);
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("text/csv")) throw new Error("not csv");
    });

    console.log(ok ? "SMOKE: PASS" : "SMOKE: FAIL");
    if (!ok) process.exitCode = 1;
  } finally {
    if (started && child) process.kill(-child.pid);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
