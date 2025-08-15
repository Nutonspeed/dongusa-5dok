import type React from "react";
import AdminLayoutClient from "./layout.client";
import { USE_SUPABASE } from "@/lib/runtime";

export const runtime = "nodejs";

const BYPASS = process.env.QA_BYPASS_AUTH === "1";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // No server-side auth when bypass or mock; simply render client layout
  if (BYPASS || !USE_SUPABASE) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
  }
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
