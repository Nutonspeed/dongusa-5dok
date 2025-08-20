import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

// This route is deprecated. Always redirect to the real auth page.
export default function AdminLoginRedirectPage() {
  redirect("/auth/login")
}
