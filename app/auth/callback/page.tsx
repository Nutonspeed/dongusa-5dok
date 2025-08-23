import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { decidePostAuthRedirect } from "@/lib/auth/redirect"

export const runtime = "nodejs"

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; redirect?: string }
}) {
  const code = searchParams.code

  if (code) {
    const supabase = await createClient()

    try {
      await supabase.auth.exchangeCodeForSession(code)

      // Read session and role to decide a role-first, safe landing
      const {
        data: { session },
      } = await supabase.auth.getSession()

      let role: "admin" | "customer" | "staff" | null | undefined = null
      if (session) {
        try {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
          role = (profile?.role as any) || null
        } catch {
          // ignore and use default fallback based on null role
        }
      }

      const dest = decidePostAuthRedirect(role, searchParams?.redirect)
      redirect(dest)
    } catch (error) {
      console.error("Auth callback error:", error)
      redirect("/auth/error?error=callback_failed")
    }
  }

  // No code: fallback to home
  redirect("/")
}
