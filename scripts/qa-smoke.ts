// Basic QA smoke: checks a few URLs and exits non-zero if any fail.
// Customize BASE_URL and endpoints as needed for your project.

import { setTimeout as delay } from "node:timers/promises";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const endpoints = [
  "/",                   // homepage or dashboard redirect
  "/api/health",         // health check route (adjust if different)
];

async function check(url: string) {
  const res = await fetch(url, { redirect: "manual" });
  const ok = res.status >= 200 && res.status < 400;
  if (!ok) {
    console.error(`❌ FAIL ${res.status} — ${url}`);
    return false;
  }
  console.log(`✅ OK  ${res.status} — ${url}`);
  return true;
}

(async () => {
  console.log("🔎 QA smoke against:", BASE_URL);
  let allGood = true;
  for (const path of endpoints) {
    await delay(50);
    const ok = await check(`${BASE_URL}${path}`);
    if (!ok) allGood = false;
  }
  process.exit(allGood ? 0 : 1);
})();
