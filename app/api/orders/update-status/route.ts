import type { NextRequest } from "next/server";
import { POST as bulkStatus } from "@/app/api/admin/orders/bulk-status/route";

export async function POST(req: NextRequest) {
  if (req.headers.get("X-Dry-Run") === "1") {
    return new Response(JSON.stringify({ alias: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return bulkStatus(req);
}
