import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  if (req.headers.get("x-dry-run") === "1") {
    return NextResponse.json({ alias: true })
  }
  const url = new URL("/api/admin/orders/bulk-status", req.nextUrl.origin)
  const body = await req.text()
  const resp = await fetch(url, {
    method: "POST",
    headers: req.headers,
    body,
    cache: "no-store",
  })
  const text = await resp.text()
  return new NextResponse(text, { status: resp.status, headers: resp.headers })
}
