export const runtime = "nodejs"

import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("orders")
      .select("id, customer_name, total, created_at")

    if (error) {
      throw error
    }

    const header = ["id", "customer_name", "total", "created_at"]
    const escapeField = (v: any) => {
      const value = v === null || v === undefined ? "" : String(v)
      const escaped = value.replace(/"/g, '""')
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
    }

    const lines = (data || []).map((row: any) =>
      header.map((key) => escapeField(row[key])).join(","),
    )

    const csv = [header.join(","), ...lines].join("\n")
    const bom = "\uFEFF"
    return new Response(bom + csv + "\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="orders.csv"',
      },
    })
  } catch (e) {
    console.error("GET /bulk-export error", e)
    return new Response("csv_error", { status: 500 })
  }
}
