import type React from "react";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./layout.client";
import { USE_SUPABASE } from "@/lib/runtime";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BYPASS = process.env.QA_BYPASS_AUTH === "1";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // No server-side auth when bypass or mock; simply render client layout
  if (BYPASS || !USE_SUPABASE) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
  }

  try {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return redirect("/auth/login");
    }
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
  } catch {
    return redirect("/auth/login");
  }
}
