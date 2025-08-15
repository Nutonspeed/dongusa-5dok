import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Ensures the requester is an administrator.
 * Allows bypass with QA_BYPASS_AUTH=1.
 * Checks role from headers or Supabase session user metadata.
 * Throws a 401/403 Response on failure.
 */
export async function requireAdmin(request: NextRequest): Promise<void> {
  if (process.env.QA_BYPASS_AUTH === "1") return

  const headerRole = request.headers.get("x-role") || request.headers.get("x-user-role")
  if (headerRole === "admin") return

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const role = (user?.user_metadata as any)?.role || (user?.app_metadata as any)?.role
    if (role === "admin") return
    throw new Response("Forbidden", { status: user ? 403 : 401 })
  } catch {
    throw new Response("Unauthorized", { status: 401 })
  }
}
