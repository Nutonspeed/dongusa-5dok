"use client"

import { AlertTriangle, CheckCircle2, Info } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"

type HealthResponse =
  | {
    status: "ok" | "degraded"
    responseTime?: number
    services?: { auth?: "ok" | "error"; database?: "ok" | "error" }
    timestamp: string
    version?: string
  }
  | {
    status: "error"
    error: string
    timestamp: string
  }

type Props = {
  // Show compact inline banner if true
  inline?: boolean
  // Poll interval in ms
  intervalMs?: number
  // Response time threshold to treat as degraded (fallback if API not provided)
  degradedThresholdMs?: number
}

export default function HealthBanner({
  inline = false,
  intervalMs = 30000,
  degradedThresholdMs = 1200,
}: Props) {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const isDegraded = useMemo(() => {
    if (!health) return false
    if (health.status === "error") return true
    if (health.status === "degraded") return true
    if (health.status === "ok" && "responseTime" in health && typeof health.responseTime === "number") {
      return health.responseTime >= degradedThresholdMs
    }
    return false
  }, [health, degradedThresholdMs])

  const isError = health?.status === "error"

  useEffect(() => {
    let mounted = true
    let timer: any

    async function fetchHealth() {
      try {
        const res = await fetch("/api/health/supabase", { cache: "no-store" })
        const json = (await res.json()) as HealthResponse
        if (mounted) {
          setHealth(json)
          setLoading(false)
        }
      } catch (e) {
        if (mounted) {
          setHealth({
            status: "error",
            error: "health_fetch_failed",
            timestamp: new Date().toISOString(),
          })
          setLoading(false)
        }
      }
    }

    fetchHealth()
    timer = setInterval(fetchHealth, Math.max(10000, intervalMs))

    return () => {
      mounted = false
      if (timer) clearInterval(timer)
    }
  }, [intervalMs])

  if (loading) return null

  // Hide when all good
  if (!isDegraded && !isError) return null

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    inline ? (
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-2">{children}</div>
    ) : (
      <div className="w-full bg-yellow-50 border-b border-yellow-200">
        <div className="mx-auto max-w-6xl px-3 py-2">{children}</div>
      </div>
    )

  return (
    <Wrapper>
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          {isError ? (
            <span className="text-red-600">
              <AlertTriangle size={18} />
            </span>
          ) : (
            <span className="text-yellow-600">
              <Info size={18} />
            </span>
          )}
          <span className="text-gray-800">
            {isError
              ? "ระบบฐานข้อมูลขัดข้องชั่วคราว กำลังจำกัดบางฟีเจอร์เพื่อป้องกันการล่ม"
              : "ระบบอยู่ในสถานะช้ากว่าปกติ/จำกัดฟีเจอร์ชั่วคราว เพื่อความเสถียร"}
          </span>
          {"status" in (health || {}) && "responseTime" in (health || {}) && (health as any).responseTime ? (
            <span className="text-gray-500">
              • RT: {(health as any).responseTime}ms
            </span>
          ) : null}
          {"services" in (health || {}) && (health as any).services ? (
            <span className="text-gray-500">
              • DB: {(health as any).services?.database ?? "?"}, Auth: {(health as any).services?.auth ?? "?"}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/health"
            className="text-gray-700 underline underline-offset-2 hover:text-gray-900"
          >
            ดูสถานะระบบ
          </Link>
          {!inline ? (
            <span className="hidden md:inline-flex items-center gap-1 text-gray-500">
              <CheckCircle2 size={16} />
              ระบบจะกลับสู่ปกติอัตโนมัติเมื่อพร้อม
            </span>
          ) : null}
        </div>
      </div>
    </Wrapper>
  )
}
