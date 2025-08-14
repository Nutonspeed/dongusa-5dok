#!/usr/bin/env bash
set -euo pipefail

echo "🔎 prebuild-guard: scanning for known build killers…"
FAIL=0

# (A) client/edge ที่ import ของฝั่ง Node (nodemailer, lib/email.ts)
echo " • Checking client/edge importing Node-only modules…"
BAD_CLIENT_IMPORTS=$(grep -RIn --exclude-dir=node_modules --exclude-dir=.next \
  -E 'from\s+["'\''\"](@/lib/email|nodemailer)["'\''\"]|require\(["'\''\"]nodemailer["'\''\"]\)' \
  app components || true)

if [[ -n "$BAD_CLIENT_IMPORTS" ]]; then
  echo "   ❌ Found client/edge importing server-only code:"
  echo "$BAD_CLIENT_IMPORTS"
  echo "   👉 แก้: ห้าม import lib/email.ts / nodemailer ใน component/page; ให้เรียกผ่าน API route แทน"
  FAIL=1
else
  echo "   ✅ No client/edge -> nodemailer/email imports"
fi

# (B) middleware ใช้ @supabase/ssr (edge จะเตือน/พัง)
echo " • Checking middleware importing @supabase/ssr…"
if grep -RIn --exclude-dir=node_modules --exclude-dir=.next -E '@supabase/ssr' middleware.ts >/dev/null 2>&1; then
  echo "   ❌ Found @supabase/ssr in middleware.ts (Edge ไม่รองรับ)"
  echo "   👉 แก้: เอาโค้ด Supabase ออกจาก middleware แล้วไปเช็กสิทธิ์ใน server components/layout แทน"
  FAIL=1
else
  echo "   ✅ No Supabase SSR in middleware"
fi

# (C) ไฟล์ลงท้าย .client / .server ที่นามสกุลไม่ถูก (.client.tsx / .server.ts)
echo " • Checking untyped .client / .server files…"
WEIRD=$(find . -type f \( -name "*.client" -o -name "*.server" \) ! -path "*/node_modules/*" ! -path "*/.next/*" || true)
if [[ -n "$WEIRD" ]]; then
  echo "   ❌ Found files with non-standard extensions:"
  echo "$WEIRD"
  echo "   👉 แก้: เปลี่ยน *.client -> *.client.tsx และใส่ '\"use client\"' บรรทัดแรก, *.server -> *.server.ts และใส่ import \"server-only\""
  FAIL=1
else
  echo "   ✅ No weird *.client/*.server filenames"
fi

# (D) server-only การันตี: lib/email.ts ต้องมี import "server-only"
echo " • Ensuring server-only markers…"
if [[ -f lib/email.ts ]] && ! grep -q 'server-only' lib/email.ts; then
  echo '   ❌ lib/email.ts missing: import "server-only"'
  FAIL=1
else
  echo "   ✅ lib/email.ts marked server-only or not present"
fi

# (E) แสดงสรุป
if [[ "$FAIL" -ne 0 ]]; then
  echo "⛔ prebuild-guard: found blocking issues. Fix above and re-run."
  exit 1
fi
echo "✅ prebuild-guard: all clear."
