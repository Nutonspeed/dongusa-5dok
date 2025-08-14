import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = process.env.BASE_URL || "";
if (!BASE_URL) { console.error("Missing BASE_URL"); process.exit(1); }

function url(p: string){ return `${BASE_URL}${p}`; }

async function check(path: string, ok = (s:number)=>s>=200&&s<400) {
  const res = await fetch(url(path), { redirect: "manual" });
  const pass = ok(res.status);
  console.log(`${pass?"✅":"❌"} ${res.status} — ${url(path)}`);
  return pass;
}

(async () => {
  let all=true;
  try {
    all = (await check("/api/health")) && all;
    all = (await check("/admin/orders")) && all;
  } catch(e){ console.log("❌", e); all=false; }

  try {
    const ids = JSON.parse(readFileSync(resolve("tmp/seed-output.json"), "utf8"));
    for (const b of ids.bills || []) {
      all = (await check(`/bill/view/${b}`)) && all;
      all = (await check(`/bill/timeline/${b}`)) && all;
    }
  } catch { console.log("⚠️ no tmp/seed-output.json, skipping bill checks"); }

  process.exit(all?0:1);
})();
