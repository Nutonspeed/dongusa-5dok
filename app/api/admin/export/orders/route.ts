import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  if (req.headers.get("x-dry-run") === "1") {
    return NextResponse.json({ alias: true })
  }
  const url = new URL("/api/admin/orders/bulk-export", req.nextUrl.origin)
  const resp = await fetch(url, { method: "GET", headers: req.headers, cache: "no-store" })
  const buf = Buffer.from(await resp.arrayBuffer())
  const res = new NextResponse(buf, { status: resp.status })
  // pass through CSV headers if provided by backend
  resp.headers.forEach((v, k) => res.headers.set(k, v))
  return res
}
