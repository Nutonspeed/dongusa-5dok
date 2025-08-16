import AdminDashboardClient from "./page.client.tsx"
import databaseClient from "@/lib/database-client"
import { USE_SUPABASE } from "@/lib/runtime"

export const runtime = "nodejs"

const BYPASS = process.env.QA_BYPASS_AUTH === "1"

export default async function AdminPage() {
  let summary: { orders: number; revenue: number } = { orders: 0, revenue: 0 }
  if (!BYPASS && USE_SUPABASE) {
    try {
      const client = databaseClient.getClient()
      if (client) {
        const { data, error } = await client.from("orders").select("total_amount")
        if (!error && data) {
          summary.orders = data.length
          summary.revenue = data.reduce((sum, row: any) => sum + Number(row.total_amount || 0), 0)
        }
      }
    } catch (e) {
      console.error("admin summary error", e)
    }
  } else {
    summary = { orders: 3, revenue: 12345.5 }
  }
  return <AdminDashboardClient summary={summary} />
}
