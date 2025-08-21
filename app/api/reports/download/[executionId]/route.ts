import type { NextRequest } from "next/server"
// Temporarily disabled to avoid importing heavy export libraries (jspdf/xlsx)
// import { advancedReportingService } from "@/lib/advanced-reporting-service"
// import { exportService } from "@/lib/export-service"

export async function GET(request: NextRequest, { params }: { params: { executionId: string } }) {
  return new Response("Report download temporarily disabled", { status: 503 })
}
