import { ordersProvider } from "@/providers/orders";

export const runtime = "nodejs";

export async function GET() {
  try {
    const csv = await ordersProvider.exportCSV();
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="orders.csv"',
      },
    });
  } catch (e) {
    console.error("GET /bulk-export error", e);
    return new Response("csv_error", { status: 500 });
  }
}
