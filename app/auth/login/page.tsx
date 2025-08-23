export const dynamic = "force-dynamic"

import { createServerClient } from "@/lib/supabase"
import { USE_SUPABASE } from "@/lib/runtime"
import { redirect } from "next/navigation"
import ModernLoginForm from "@/components/ModernLoginForm"
import { decidePostAuthRedirect } from "@/lib/auth/redirect"

export const runtime = "nodejs"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string }
}) {
  if (USE_SUPABASE) {
  const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      let role: "admin" | "customer" | "staff" | null | undefined = null
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
        role = (profile?.role as any) || null
      } catch {
        // ignore and fallback to default
      }
      const dest = decidePostAuthRedirect(role, searchParams?.redirect)
      redirect(dest)
    }
  }

  return (
    <div className="min-h-screen bg-login-light-gradient flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="relative z-10 w-full max-w-md">
        <ModernLoginForm />
      </div>
    </div>
  )
}
