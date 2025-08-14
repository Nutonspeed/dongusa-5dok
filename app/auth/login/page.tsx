export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { USE_SUPABASE } from "@/lib/runtime"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

export default async function LoginPage() {
  if (!USE_SUPABASE) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <LoginForm />
      </div>
    )
  }

  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  )
}
