export const runtime = "nodejs";

import AdminDashboardClient from "./page.client";
import { USE_SUPABASE } from "@/lib/runtime";
import { createClient } from "@/lib/supabase/server";

type Summary = { orders: number; revenue: number };

export default async function AdminPage() {
  let summary: Summary = { orders: 0, revenue: 0 };

  if (!USE_SUPABASE) {
    summary = { orders: 3, revenue: 12345.5 };
    return <AdminDashboardClient summary={summary} />;
  }

  try {
    const supabase = createClient();
    const { data: sData } = await supabase.auth.getSession();
    const session = sData?.session;
    if (!session?.user) {
      // Layout will handle redirect
      return null;
    }

    // TODO: query orders/revenue with supabase and update summary
    // const { data: orders, error } = await supabase
    //   .from("orders")
    //   .select("total_amount")
    //   .eq("user_id", session.user.id);
    // if (!error && orders) {
    //   summary = {
    //     orders: orders.length,
    //     revenue: orders.reduce((acc, o: any) => acc + (o.total_amount || 0), 0),
    //   };
    // }
  } catch {
    summary = { orders: 0, revenue: 0 };
  }

  return <AdminDashboardClient summary={summary} />;
}
