import { ordersProvider } from "@/providers/orders";
import { requireAdmin } from "@/lib/auth/getUser";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const csv = await ordersProvider.exportCSV();
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="orders.csv"',
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return new Response("Unauthorized", { status: 401 });
    }
    console.error("GET /bulk-export error", e);
    return new Response("csv_error", { status: 500 });
  }
}
