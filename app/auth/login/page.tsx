export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { USE_SUPABASE } from "@/lib/runtime"
import { redirect } from "next/navigation"
import ModernLoginForm from "@/components/ModernLoginForm"

export const runtime = "nodejs"

export default async function LoginPage() {
  if (USE_SUPABASE) {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect("/")
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
