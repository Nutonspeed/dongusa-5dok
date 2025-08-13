import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USE_SUPABASE } from "@/lib/runtime";

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
