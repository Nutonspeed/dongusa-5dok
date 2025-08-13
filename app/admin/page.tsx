import AdminDashboardClient from "./page.client";
import { USE_SUPABASE } from "@/lib/runtime";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BYPASS = process.env.QA_BYPASS_AUTH === "1";

export default async function AdminPage() {
  let summary: { orders: number; revenue: number } = { orders: 0, revenue: 0 };

  if (!BYPASS && USE_SUPABASE) {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        return null;
      }

      // TODO: query orders/revenue with supabase and update summary
      // const { data } = await supabase.from("orders").select("total_amount");
      // summary.orders = data.length;
      // summary.revenue = data.reduce((sum, row: any) => sum + Number(row.total_amount || 0), 0);
    } catch {
      // swallow errors to avoid crashing admin page
    }
  } else {
    summary = { orders: 3, revenue: 12345.5 };
  }

  return <AdminDashboardClient summary={summary} />;
}
