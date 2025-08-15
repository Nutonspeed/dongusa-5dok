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

    let health: any = null;
    await check("GET /api/health", async () => {
      const res = await fetch(`${BASE}/api/health`);
      if (res.status !== 200) throw new Error(`status ${res.status}`);
      health = await res.json();
      if (health.mode !== "supabase") throw new Error("supabase off");
    });

    await check("POST /api/admin/orders/bulk-status idempotent", async () => {
      const key = Date.now().toString();
      const body = {
        ids: ["00000000-0000-0000-0000-000000000000"],
        status: "PENDING",
        idempotencyKey: key,
      };
      const res1 = await fetch(`${BASE}/api/admin/orders/bulk-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res1.status !== 200) throw new Error(`status ${res1.status}`);
      const data1 = await res1.json();
      const res2 = await fetch(`${BASE}/api/admin/orders/bulk-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data2 = await res2.json();
      if (res2.status !== 200) throw new Error(`status ${res2.status}`);
      if (JSON.stringify(data1) !== JSON.stringify(data2)) throw new Error("idempotency failed");
    });

    await check("GET /api/mobile/orders", async () => {
      const res = await fetch(`${BASE}/api/mobile/orders?userId=test&limit=10`);
      if (res.status !== 200) throw new Error(`status ${res.status}`);
      const data = await res.json();
      if (typeof data.pagination?.totalPages !== "number") throw new Error("missing totalPages");
    });

    await check("GET /api/admin/orders/bulk-export", async () => {
      const res = await fetch(`${BASE}/api/admin/orders/bulk-export`);
      if (res.status !== 200) throw new Error(`status ${res.status}`);
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      if (bytes[0] !== 0xef || bytes[1] !== 0xbb || bytes[2] !== 0xbf)
        throw new Error("missing BOM");
    });

    const bulkEndpoints = [
      {
        label: "POST /api/admin/orders/messages/bulk-preset",
        url: `${BASE}/api/admin/orders/messages/bulk-preset`,
        body: {
          orderIds: ["00000000-0000-0000-0000-000000000000"],
          presetId: "payment_reminder",
        },
      },
      {
        label: "POST /api/admin/orders/shipping/create-labels",
        url: `${BASE}/api/admin/orders/shipping/create-labels`,
        body: { orderIds: ["00000000-0000-0000-0000-000000000000"] },
      },
    ];

    for (const ep of bulkEndpoints) {
      await check(ep.label, async () => {
        const res = await fetch(ep.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ep.body),
        });
        if (res.status !== 200) throw new Error(`status ${res.status}`);
      });
    }

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
