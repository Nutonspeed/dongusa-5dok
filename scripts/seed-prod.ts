// Seed minimal-but-complete records to exercise the full flow on REAL DB.
// Safety guards: requires ALLOW_SEED_PROD=1 AND SUPABASE_SERVICE_ROLE_KEY.
// Tables assumed: customers, orders, bills, bill_items, payments, shipments, activity_logs
// Adjust table/column names if your schema differs.

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

type Id = string;

function env(name: string, required = true): string {
  const v = process.env[name];
  if (!v && required) throw new Error(`Missing env: ${name}`);
  return v || "";
}

function assertGuards() {
  if (process.env.ALLOW_SEED_PROD !== "1") {
    throw new Error("Refused: set ALLOW_SEED_PROD=1 to seed REAL DB");
  }
  // Not forcing NODE_ENV=production (some hosts set differently), but require SERVICE_ROLE for safety.
}

const nowIso = () => new Date().toISOString();

async function upsert<T extends Record<string, any>>(
  sb: any,
  table: string,
  match: Partial<T>,
  payload: T
) {
  const { data, error } = await sb.from(table).upsert(payload, { onConflict: Object.keys(match).join(","), ignoreDuplicates: false }).select();
  if (error) throw new Error(`[${table}] upsert error: ${error.message}`);
  return data?.[0] ?? null;
}

async function main() {
  assertGuards();
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const sb = createClient(url, key, { auth: { persistSession: false } });

  // 1) Customers
  const customerA = {
    id: "cust_demo_alice",
    name: "Alice Sofa",
    phone: "081-000-0001",
    email: "alice@example.com",
    address: "99/1 ถนนตัวอย่าง เขตตัวอย่าง กทม.",
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  const customerB = {
    id: "cust_demo_bob",
    name: "Bob Cover",
    phone: "081-000-0002",
    email: "bob@example.com",
    address: "101/7 ถนนตัวอย่าง เขตตัวอย่าง กทม.",
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  await upsert(sb, "customers", { id: customerA.id }, customerA);
  await upsert(sb, "customers", { id: customerB.id }, customerB);

  // 2) Orders (cover major statuses)
  const orderIds: Id[] = [
    "ord_demo_pending",
    "ord_demo_processing",
    "ord_demo_shipped",
    "ord_demo_complete",
  ];
  const statuses = ["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "COMPLETE"];

  const orders = orderIds.map((id, i) => ({
    id,
    customer_id: i % 2 === 0 ? customerA.id : customerB.id,
    status: statuses[i],
    subtotal: 1290 + i * 200,
    shipping_fee: 80,
    discount: i === 0 ? 0 : 50,
    total: 1290 + i * 200 + 80 - (i === 0 ? 0 : 50),
    created_at: nowIso(),
    updated_at: nowIso(),
  }));

  for (const o of orders) {
    await upsert(sb, "orders", { id: o.id }, o);
  }

  // 3) Bills + Bill items (1:1 to orders for demo)
  const bills = orders.map((o) => ({
    id: `bill_${o.id}`,
    order_id: o.id,
    status: o.status === "PENDING_PAYMENT" ? "PENDING_PAYMENT" : "WAITING_CONFIRM" in o ? "WAITING_CONFIRM" : o.status,
    amount: o.total,
    currency: "THB",
    due_date: new Date(Date.now() + 3 * 86400e3).toISOString(),
    created_at: nowIso(),
    updated_at: nowIso(),
  }));
  for (const b of bills) {
    await upsert(sb, "bills", { id: b.id }, b);
    const item = {
      id: `${b.id}_item1`,
      bill_id: b.id,
      sku: "FABRIC-ELF-001",
      name: "ELF Sofa Cover",
      qty: 1,
      unit_price: b.amount,
      total_price: b.amount,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    await upsert(sb, "bill_items", { id: item.id }, item);
  }

  // 4) Payments (for shipped/complete)
  const payments = bills
    .filter((b) => ["SHIPPED", "COMPLETE"].includes(orders.find((o) => o.id === b.order_id)!.status))
    .map((b, idx) => ({
      id: `pay_${b.id}`,
      bill_id: b.id,
      method: "BANK_TRANSFER",
      amount: b.amount,
      paid_at: nowIso(),
      ref_code: `TX-${String(idx + 1).padStart(4, "0")}`,
      created_at: nowIso(),
      updated_at: nowIso(),
    }));
  for (const p of payments) {
    await upsert(sb, "payments", { id: p.id }, p);
  }

  // 5) Shipments (for shipped/complete)
  const shipments = bills
    .filter((b) => ["SHIPPED", "COMPLETE"].includes(orders.find((o) => o.id === b.order_id)!.status))
    .map((b, idx) => ({
      id: `shp_${b.id}`,
      order_id: b.order_id,
      status: "IN_TRANSIT",
      carrier: "Flash",
      tracking_no: `TH12345${idx}`,
      shipped_at: nowIso(),
      created_at: nowIso(),
      updated_at: nowIso(),
    }));
  for (const s of shipments) {
    await upsert(sb, "shipments", { id: s.id }, s);
  }

  // 6) Activity logs (sample)
  for (const o of orders) {
    await upsert(sb, "activity_logs", { id: `log_${o.id}_created` }, {
      id: `log_${o.id}_created`,
      entity: "order",
      entity_id: o.id,
      action: "CREATED",
      message: `Order ${o.id} created by seeder`,
      created_at: nowIso(),
    });
  }

  // Save outputs for QA
  mkdirSync("tmp", { recursive: true });
  const out = {
    customers: [customerA.id, customerB.id],
    orders: orderIds,
    bills: bills.map((b) => b.id),
  };
  writeFileSync(resolve("tmp/seed-output.json"), JSON.stringify(out, null, 2));
  console.log("✅ Seed complete. Output saved to tmp/seed-output.json");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});

