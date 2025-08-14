import { redirect } from "next/navigation"
import { requireAdminSafe } from "@/lib/safe-auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await requireAdminSafe()
  if (!ok) redirect("/auth/signin")
  return <>{children}</>
}
