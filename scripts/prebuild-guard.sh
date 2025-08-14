#!/usr/bin/env bash
set -euo pipefail
echo "🔎 prebuild-guard: scanning for build killers…"
FAIL=0

# A) client/edge import server-only (nodemailer / lib/email.ts)
BAD_CLIENT_IMPORTS=$(grep -RIn --exclude-dir=node_modules --exclude-dir=.next   -E 'from\s+["''](@/lib/email|nodemailer)["'']|require\(["'']nodemailer["'']\)'   app components || true)
if [[ -n "${BAD_CLIENT_IMPORTS}" ]]; then
  echo "❌ client/edge importing server-only:"
  echo "${BAD_CLIENT_IMPORTS}"
  echo "👉 ใช้ API route (runtime=nodejs) แทนการ import โดยตรงใน component/page"
  FAIL=1
else
  echo "✅ no client/edge → nodemailer/email imports"
fi

# B) middleware ใช้ @supabase/ssr (Edge ไม่รองรับ)
if grep -RIn --exclude-dir=node_modules --exclude-dir=.next -E '@supabase/ssr' middleware.ts >/dev/null 2>&1; then
  echo "❌ middleware.ts imports @supabase/ssr (edge ไม่รองรับ)"; FAIL=1
else
  echo "✅ no supabase ssr import in middleware"
fi

# C) ไฟล์ *.client / *.server ที่ไม่มีนามสกุลมาตรฐาน
WEIRD=$(find app -type f \( -name "*.client" -o -name "*.server" \) 2>/dev/null || true)
if [[ -n "${WEIRD}" ]]; then
  echo "❌ non-standard extensions:"; echo "${WEIRD}"
  echo "👉 *.client -> *.client.tsx (+ 'use client'); *.server -> *.server.ts (+ import \"server-only\")"
  FAIL=1
else
  echo "✅ no weird *.client/*.server filenames"
fi

# D) lib/email.ts ต้อง server-only
if [[ -f lib/email.ts ]] && ! grep -q 'server-only' lib/email.ts; then
  echo '❌ lib/email.ts missing: import "server-only"'; FAIL=1
else
  echo "✅ lib/email.ts server-only OK (or missing)"
fi

# E) loading.client.tsx ต้องมี "use client"
MISS=$(grep -RIl --include='*loading.client.tsx' --exclude-dir=node_modules --exclude-dir=.next -E '^(?!"use client")' app || true)
if [[ -n "${MISS}" ]]; then
  echo "❌ missing \"use client\" in:"; echo "${MISS}"; FAIL=1
else
  echo "✅ loading.client.tsx has \"use client\""
fi

[[ $FAIL -ne 0 ]] && { echo "⛔ prebuild-guard: fix issues above"; exit 1; }
echo "✅ prebuild-guard: all clear."
