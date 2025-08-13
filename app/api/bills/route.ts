import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const body = await req.json().catch(() => ({}));
      const id = crypto.randomUUID();
      return NextResponse.json({ id, ...body, mock: true }, { status: 201 });
    }

    const body = await req.json();
    const { enhancedBillDatabase } = await import("@/lib/enhanced-bill-database");
    const bill = await enhancedBillDatabase.createBill({
      billNumber: body.billNumber || `BILL-${Date.now()}`,
      customerEmail: body.customerEmail || "customer@example.com",
      customerName: body.customerName || "Mock Customer",
      amount: body.amount || 0,
      status: body.status || "draft",
      createdAt: new Date().toISOString(),
      dueDate: body.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      items: body.items || [],
    });
    return NextResponse.json(bill, { status: 201 });
  } catch (e) {
    console.error("POST /api/bills error", e);
    return NextResponse.json({ error: "bill_error" }, { status: 500 });
  }
}
