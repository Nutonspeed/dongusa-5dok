import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === "true";

export const config = { matcher: ["/admin", "/admin/:path*"] };

export default function middleware(req: NextRequest) {
  // 1) QA bypass always wins
  if (process.env.QA_BYPASS_AUTH === "1") {
    return new NextResponse(null, { status: 200 });
  }

  // 2) Mock mode: no redirects, no auth calls
  if (!USE_SUPABASE) return NextResponse.next();

  // 3) Maintenance: rewrite to /maintenance (no errors)
  if (process.env.MAINTENANCE === "1") {
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }

  // 4) Normal flow
  return NextResponse.next();
}
