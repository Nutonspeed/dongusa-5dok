import { NextResponse } from "next/server";
import { z } from "zod";
import { estimatePrice } from "@/utils/sofa-pricing";

export const runtime = 'nodejs';

const Body = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(6).optional(),
    notes: z.string().max(1000).optional(),
  }),
  measurements: z.object({
    width_cm: z.number().min(30).max(400),
    depth_cm: z.number().min(30).max(300),
    height_cm: z.number().min(20).max(150),
    seats: z.number().int().min(1).max(10),
    skirt: z.enum(["none","short","long"]),
    piping: z.boolean(),
    extra_cushions: z.number().int().min(0).max(10),
    quantity: z.number().int().min(1).max(50)
  }),
  fabric: z.object({
    id: z.string().min(1),
    code: z.string().optional(),
    name: z.string().min(1),
    price_per_m: z.number().min(1),
    width_cm: z.number().optional()
  })
});

function supabaseConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = Body.parse(json);

    const breakdown = estimatePrice({
      ...parsed.measurements,
      fabric: parsed.fabric,
    });

    // บันทึกเข้า Supabase ถ้าพร้อม
    if (supabaseConfigured()) {
      try {
        const { createServerClient } = await import("@/lib/supabase/server"); // server-only
        const supa = createServerClient();
        await supa.from("custom_sofa_quotes").insert({
          customer_name: parsed.customer.name,
          customer_email: parsed.customer.email ?? null,
          customer_phone: parsed.customer.phone ?? null,
          notes: parsed.customer.notes ?? null,
          width_cm: parsed.measurements.width_cm,
          depth_cm: parsed.measurements.depth_cm,
          height_cm: parsed.measurements.height_cm,
          seats: parsed.measurements.seats,
          skirt: parsed.measurements.skirt,
          piping: parsed.measurements.piping,
          extra_cushions: parsed.measurements.extra_cushions,
          quantity: parsed.measurements.quantity,
          fabric_id: parsed.fabric.id,
          fabric_code: parsed.fabric.code ?? null,
          fabric_name: parsed.fabric.name,
          fabric_price_per_m: parsed.fabric.price_per_m,
          meters_est: breakdown.meters,
          price_fabric: breakdown.fabric_cost,
          price_labor: breakdown.labor_cost,
          price_total_per_item: breakdown.total_per_item,
          price_total: breakdown.total,
          status: "new",
        });
      } catch (e) {
        // ไม่ทำให้ล้ม: ถ้าบันทึกไม่ได้ยังคงตอบ estimate ให้ user
        console.error("[quote] insert failed:", e);
      }
    }

    return NextResponse.json({ ok: true, breakdown });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "invalid" }, { status: 400 });
  }
}
