"use client"

import Link from "next/link";
import { useEffect } from "react";

/**
 * Admin Error Boundary
 * - ป้องกันหน้าแดชบอร์ดแอดมิน crash ด้วยข้อความที่เข้าใจง่าย
 * - มีปุ่มลองใหม่ (reset) และปุ่มกลับแดชบอร์ด/หน้าแรก
 */
export default function AdminError({ error, reset }: { error: any; reset: () => void }) {
  useEffect(() => {
    // จุดต่อเข้าระบบติดตาม (เช่น Sentry) ได้
    // console.error("[AdminErrorBoundary]", error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-4">
      <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700">
            ❗
          </span>
          <h1 className="text-xl font-semibold text-gray-900">แดชบอร์ดผู้ดูแลระบบมีข้อผิดพลาด</h1>
        </div>

        <p className="mt-2 text-sm text-gray-600">
          ฟีเจอร์บางส่วนยังไม่พร้อมหรือบริการภายนอกไม่ตอบสนอง ระบบได้จำกัดการทำงานเพื่อกันล่มชั่วคราว
        </p>

        {process.env.NODE_ENV !== "production" ? (
          <pre className="mt-3 max-h-40 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-700">
            {String(error?.message || error)}
          </pre>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            ลองใหม่
          </button>

          <Link
            href="/admin"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            กลับแดชบอร์ด
          </Link>

          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            หน้าแรก
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          หากเป็นปัญหาซ้ำๆ โปรดแจ้งผู้ดูแลระบบ พร้อมเวลาที่เกิดเหตุและฟังก์ชันที่ใช้งาน
        </p>
      </div>
    </main>
  )
}
