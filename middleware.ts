import { USE_SUPABASE } from "@/lib/runtime"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  if (USE_SUPABASE) {
    const { updateSession } = await import("@/lib/supabase/middleware")
    return await updateSession(request)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
