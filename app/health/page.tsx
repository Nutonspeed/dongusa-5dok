import { headers } from "next/headers"

function getBaseUrl(): string {
  const h = headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}

async function getJson(path: string, baseUrl: string) {
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`
  try {
    const res = await fetch(url, { cache: "no-store" })
    const data = await res.json()
    return { ok: res.ok, data }
  } catch (e: any) {
    return { ok: false, data: { error: e?.message || "fetch_failed", url } }
  }
}

export default async function HealthPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || getBaseUrl()

  const [root, supabase, db, payment, storage] = await Promise.all([
    getJson("/api/health", baseUrl),
    getJson("/api/health/supabase", baseUrl),
    getJson("/api/health/database", baseUrl),
    getJson("/api/health/payment", baseUrl),
    getJson("/api/health/storage", baseUrl),
  ])

  const Card = ({ title, payload }: { title: string; payload: any }) => (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-gray-800">{title}</div>
      <pre className="max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  )

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
      <p className="mt-1 text-sm text-gray-600">
        หน้าตรวจสุขภาพระบบแบบตรงไปตรงมา ใช้สำหรับดูสถานะ API และบริการเชื่อมต่อ
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="/api/health" payload={root} />
        <Card title="/api/health/supabase" payload={supabase} />
        <Card title="/api/health/database" payload={db} />
        <Card title="/api/health/payment" payload={payment} />
        <Card title="/api/health/storage" payload={storage} />
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <ul className="list-disc pl-5">
          <li>หากสถานะเป็น degraded/error ระบบจะลดฟังก์ชันบางส่วนเพื่อความเสถียร</li>
          <li>ค่าเหล่านี้ไม่ถูกแคช (no-store) เพื่อให้เห็นสถานะปัจจุบันจริง</li>
        </ul>
      </div>
    </main>
  )
}
