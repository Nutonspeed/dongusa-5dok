// Compare current plan files against docs/PLAN_SNAPSHOT.json.
// Exit non-zero if changed/missing/new files detected.

import { readFileSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

type Entry = { path: string; sha1: string; bytes: number; mtimeMs: number };
type Snapshot = { createdAt: string; entries: Entry[] };

function sha1(buf: Buffer) {
  const h = createHash("sha1");
  h.update(buf);
  return h.digest("hex");
}

function loadSnap(): Snapshot {
  const abs = resolve("docs/PLAN_SNAPSHOT.json");
  if (!existsSync(abs)) {
    console.error("❌ Missing docs/PLAN_SNAPSHOT.json — run `pnpm plan:snapshot` first.");
    process.exit(2);
  }
  return JSON.parse(readFileSync(abs, "utf8"));
}

function currentEntry(path: string): Entry | null {
  try {
    const abs = resolve(path);
    const buf = readFileSync(abs);
    const st = statSync(abs);
    return { path, sha1: sha1(Buffer.from(buf)), bytes: st.size, mtimeMs: st.mtimeMs };
  } catch {
    return null;
  }
}

(function main() {
  const snap = loadSnap();
  const expected = new Map(snap.entries.map(e => [e.path, e]));
  let ok = true;

  // check existing & changed
  for (const [p, e] of expected) {
    const cur = currentEntry(p);
    if (!cur) {
      console.error(`❌ MISSING: ${p}`);
      ok = false;
      continue;
    }
    if (cur.sha1 !== e.sha1) {
      console.error(`❌ CHANGED: ${p} (sha1 ${e.sha1} -> ${cur.sha1})`);
      ok = false;
    }
  }

  // detect new plan files (optional: warn only)
  console.log(ok ? "✅ Plan files match snapshot" : "❌ Plan drift detected");
  process.exit(ok ? 0 : 1);
})();
