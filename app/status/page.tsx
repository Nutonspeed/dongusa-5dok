async function getJson(path: string) {
  try {
    const res = await fetch(path, { cache: "no-store" })
    const data = await res.json()
    return { ok: res.ok, data }
  } catch (e: any) {
    return { ok: false, data: { error: e?.message || "fetch_failed" } }
  }
}

export default async function StatusPage() {
  const root = await getJson("/api/health")
  const supabase = await getJson("/api/health/supabase")
  const db = await getJson("/api/health/database")
  const payment = await getJson("/api/health/payment")
  const storage = await getJson("/api/health/storage")

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
      <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
      <p className="mt-1 text-sm text-gray-600">
        หน้าสรุปสถานะระบบ แสดงผลจากจุดตรวจสุขภาพหลัก (API/ฐานข้อมูล/การชำระเงิน/ที่เก็บไฟล์)
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
          <li>ถ้าใดๆ เป็น degraded/error ระบบจะลดฟังก์ชันบางส่วนเพื่อความเสถียร</li>
          <li>หน้านี้ไม่แคชข้อมูล (no-store) เพื่อสะท้อนสถานะล่าสุด</li>
        </ul>
      </div>
    </main>
  )
}
