export const runtime = "nodejs"

import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/requireAdmin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  await requireAdmin(request)
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("orders").select("id, total_amount, created_at")

    if (error) {
      throw error
    }

    const header = ["id", "total_amount", "created_at"]
    const escapeField = (v: any) => {
      const value = v === null || v === undefined ? "" : String(v)
      const escaped = value.replace(/"/g, '""').replace(/\r?\n/g, "\\n")
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
    }

    const lines = (data || []).map((row: any) => header.map((key) => escapeField(row[key])).join(","))

    const csv = [header.join(","), ...lines].join("\n")
    const bom = "\uFEFF"
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, "0")
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate(),
    )}_${pad(now.getHours())}${pad(now.getMinutes())}`
    return new Response(bom + csv + "\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders_${ts}.csv"`,
      },
    })
  } catch (e) {
    console.error("GET /bulk-export error", e)
    return new Response("csv_error", { status: 500 })
  }
}
