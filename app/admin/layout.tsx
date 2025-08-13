export const runtime = "nodejs";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { USE_SUPABASE } from "@/lib/runtime";
import { createClient } from "@/lib/supabase/server";
import AdminLayoutClient from "./layout.client";

type Props = { children: ReactNode };

export default async function AdminLayout({ children }: Props) {
  if (!USE_SUPABASE) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session;
    if (error || !session?.user) {
      return redirect("/auth/login");
    }
  } catch {
    return redirect("/auth/login");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
