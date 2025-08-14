// Create baseline snapshot (hashes + sizes + mtime) for plan files.
// Run this AFTER you confirm current docs are the source of truth.
// Output: docs/PLAN_SNAPSHOT.json

import { readFileSync, statSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

type Entry = { path: string; sha1: string; bytes: number; mtimeMs: number };

function sha1(buf: Buffer) {
  const h = createHash("sha1");
  h.update(buf);
  return h.digest("hex");
}

function loadTargets(): string[] {
  const raw = readFileSync(resolve("scripts/plan-targets.json"), "utf8");
  const j = JSON.parse(raw);
  const list: string[] = [...(j.roots || []), ...(j.docs || [])];
  return list;
}

function snapshot(paths: string[]): Entry[] {
  return paths.map((p) => {
    const abs = resolve(p);
    const buf = readFileSync(abs);
    const st = statSync(abs);
    return { path: p, sha1: sha1(Buffer.from(buf)), bytes: st.size, mtimeMs: st.mtimeMs };
  });
}

(function main() {
  const paths = loadTargets();
  const entries = snapshot(paths);
  if (!existsSync("docs")) mkdirSync("docs", { recursive: true });
  writeFileSync(resolve("docs/PLAN_SNAPSHOT.json"), JSON.stringify({ createdAt: new Date().toISOString(), entries }, null, 2));
  console.log("✅ Wrote docs/PLAN_SNAPSHOT.json for", entries.length, "files");
})();
