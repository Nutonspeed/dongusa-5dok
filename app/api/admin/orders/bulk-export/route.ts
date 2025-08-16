export const runtime = "nodejs";

export async function GET() {
  try {
    const header = "id,customer,total\n";
    const lines = ["mock-1,คุณเอ,1234.50", "mock-2,คุณบี,999.00"].join("\n");
    return new Response(header + lines + "\n", {
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
