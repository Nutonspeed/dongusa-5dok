import type { NextRequest } from "next/server";
import { GET as bulkExport } from "@/app/api/admin/orders/bulk-export/route";

export async function GET(req: NextRequest) {
  if (req.headers.get("X-Dry-Run") === "1") {
    return new Response(JSON.stringify({ alias: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return bulkExport(req);
}
