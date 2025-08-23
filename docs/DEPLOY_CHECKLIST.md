# การตรวจสอบก่อนการดีพลอย (Deploy) — สรุปด่วน

เป้าหมาย: ให้ pipeline ล้มเหลวอย่างรวดเร็วเมื่อค่าที่จำเป็นขาด และลดปัญหา runtime ขณะ static generation/preview

## สิ่งที่ต้องตั้งค่าใน Vercel / CI (จำเป็น)

- NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon/public key (สำหรับ client-side)
- NEXT_PUBLIC_USE_SUPABASE — true/false (ควรตั้งเป็น true ใน production ถ้าใช้ Supabase จริง)
- SUPABASE_SERVICE_ROLE_KEY — (เฉพาะงานเซิร์ฟเวอร์ที่ต้องการสิทธิ์สูง)
- BLOB_READ_WRITE_TOKEN — Vercel Blob read/write token (ถ้าใช้ Vercel Blob)
- KV_REST_API_URL / KV_REST_API_TOKEN — (ถ้ามีการใช้ external KV/REST cache)
- STRIPE_SECRET_KEY — สำหรับการชำระเงิน (ถ้ามี)

## สิ่งที่ควรตั้งค่า (แนะนำ)

- XAI_API_KEY — ถ้าเรียกใช้งาน xAI/AI services
- UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN — ถ้าใช้ Upstash

## CI / Build Checklist (แนะนำให้เรียกใน workflow ก่อน build)

1) ตรวจสอบตัวแปรแวดล้อมที่จำเป็น (script: `node scripts/ci-validate-env.js`).
2) ติดตั้ง dependency (`pnpm install --frozen-lockfile`).
3) รัน health-checks เบื้องต้น (`pnpm exec tsx scripts/website-health-check.ts`).
4) รัน build (`pnpm run build`).
5) รัน test suite (`pnpm test` / `pnpm qa:smoke` ตามที่ทีมกำหนด).

## แนวทางแก้ปัญหา runtime ในระหว่าง SSG/preview

- ถ้า build รายงานว่าแพ็กเกจ (เช่น @supabase/supabase-js หรือ @supabase/realtime-js) ใช้ Node-only APIs ในไฟล์ที่รันบน Edge runtime ให้:
  - เปลี่ยนให้ไฟล์นั้นรันบน Node runtime: export const runtime = 'nodejs'
  - หรือ ใช้ dynamic import ภายในฟังก์ชัน server-side เพื่อเลี่ยงการ bundle ใน runtime ที่ไม่รองรับ: const { createClient } = await import('@supabase/supabase-js')

## การดีพลอย / รีวิวถ้าพบปัญหา

- หาก SSG ล้มเหลว (เช่น Vercel Blob token missing) ให้ตรวจสอบว่าตัวแปรถูกตั้งใน environment ของ Preview/Production
- ถ้าพบ warnings เกี่ยวกับ Edge runtime ให้หาตำแหน่ง import ของ Supabase และปรับเป็น dynamic import หรือเปลี่ยน runtime

## เอกสารอ้างอิงสั้น

- ไฟล์ตรวจสอบ env ของ repo: `scripts/ci-validate-env.js`
- health-check: `scripts/website-health-check.ts`
- ถ้าต้องการเพิ่มการตรวจใน CI ให้ดู: `.github/workflows/ci.yml`

ถ้าต้องการ ผมสามารถสร้าง workflow ตัวอย่าง (.github/workflows/ci.yml) ให้ทีมใช้ได้ทันที
