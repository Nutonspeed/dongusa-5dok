import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"

export default async function ProtectedPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 p-6">
      <h1 className="text-2xl font-bold">Protected Page</h1>
      <p>Welcome, {data.user.email}!</p>
      <p>This page is only accessible to authenticated users.</p>
    </div>
  )
}
