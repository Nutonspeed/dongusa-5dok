import type React from "react";
import AdminLayoutClient from "./layout.client";
import { ENV } from "@/lib/config/env";
import { requireAdmin } from "@/lib/auth/getUser";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      {ENV.QA_BYPASS_AUTH && (
        <div className="bg-yellow-200 text-center text-sm py-1">QA Bypass Active</div>
      )}
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </>
  );
}
