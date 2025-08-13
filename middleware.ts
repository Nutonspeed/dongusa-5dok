import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === "true";

export const config = { matcher: ["/admin", "/admin/:path*"] };

export default function middleware(req: NextRequest) {
  // In bypass or mock mode just continue
  if (process.env.QA_BYPASS_AUTH === "1" || !USE_SUPABASE) {
    return NextResponse.next();
  }

  // Maintenance: rewrite to /maintenance (no errors)
  if (process.env.MAINTENANCE === "1") {
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }

  // Normal flow
  return NextResponse.next();
}
