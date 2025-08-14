// Same as earlier seed — safe idempotent, guarded by ALLOW_SEED_PROD.
// Keep or replace with your existing version if present.

import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
const now = () => new Date().toISOString();

function req(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function upsert(sb: any, table: string, row: any, conflictKeys: string[]) {
  const { error } = await sb.from(table).upsert(row, { onConflict: conflictKeys.join(","), ignoreDuplicates: false });
  if (error) throw new Error(`[${table}] ${error.message}`);
}

(async () => {
  if (process.env.ALLOW_SEED_PROD !== "1") throw new Error("Refused: set ALLOW_SEED_PROD=1");
  const sb = createClient(req("SUPABASE_URL"), req("SUPABASE_SERVICE_ROLE_KEY"));

  const customers = [
    { id: "cust_demo_alice", name: "Alice Sofa", phone: "081-000-0001", email: "alice@example.com", address: "99/1 …", created_at: now(), updated_at: now() },
    { id: "cust_demo_bob",   name: "Bob Cover",  phone: "081-000-0002", email: "bob@example.com",   address: "101/7 …", created_at: now(), updated_at: now() }
  ];
  for (const c of customers) await upsert(sb, "customers", c, ["id"]);

  const orders = [
    { id: "ord_demo_pending",   customer_id: "cust_demo_alice", status: "PENDING_PAYMENT", subtotal: 1290, shipping_fee: 80, discount: 0, total: 1370, created_at: now(), updated_at: now() },
    { id: "ord_demo_processing",customer_id: "cust_demo_bob",   status: "PROCESSING",      subtotal: 1490, shipping_fee: 80, discount: 50, total: 1520, created_at: now(), updated_at: now() },
    { id: "ord_demo_shipped",   customer_id: "cust_demo_alice", status: "SHIPPED",         subtotal: 1690, shipping_fee: 80, discount: 50, total: 1720, created_at: now(), updated_at: now() },
    { id: "ord_demo_complete",  customer_id: "cust_demo_bob",   status: "COMPLETE",        subtotal: 1890, shipping_fee: 80, discount: 50, total: 1920, created_at: now(), updated_at: now() }
  ];
  for (const o of orders) await upsert(sb, "orders", o, ["id"]);

  const bills = orders.map(o => ({
    id: `bill_${o.id}`, order_id: o.id, status: o.status === "PENDING_PAYMENT" ? "PENDING_PAYMENT" : o.status,
    amount: o.total, currency: "THB", due_date: new Date(Date.now()+3*86400e3).toISOString(), created_at: now(), updated_at: now()
  }));
  for (const b of bills) {
    await upsert(sb, "bills", b, ["id"]);
    await upsert(sb, "bill_items", { id: `${b.id}_item1`, bill_id: b.id, sku: "FABRIC-ELF-001", name: "ELF Sofa Cover", qty: 1, unit_price: b.amount, total_price: b.amount, created_at: now(), updated_at: now() }, ["id"]);
  }

  const payments = bills.filter(b => /(SHIPPED|COMPLETE)$/.test(b.status)).map((b,i)=>({
    id:`pay_${b.id}`, bill_id:b.id, method:"BANK_TRANSFER", amount:b.amount, paid_at: now(), ref_code:`TX-${String(i+1).padStart(4,"0")}`, created_at:now(), updated_at:now()
  }));
  for (const p of payments) await upsert(sb, "payments", p, ["id"]);

  const shipments = bills.filter(b => /(SHIPPED|COMPLETE)$/.test(b.status)).map((b,i)=>({
    id:`shp_${b.id}`, order_id:b.order_id, status:"IN_TRANSIT", carrier:"Flash", tracking_no:`TH12345${i}`, shipped_at:now(), created_at:now(), updated_at:now()
  }));
  for (const s of shipments) await upsert(sb, "shipments", s, ["id"]);

  mkdirSync("tmp", { recursive: true });
  writeFileSync(resolve("tmp/seed-output.json"), JSON.stringify({ orders: orders.map(o=>o.id), bills: bills.map(b=>b.id) }, null, 2));
  console.log("✅ Seed complete");
})().catch(e=>{ console.error("❌ Seed failed:", e); process.exit(1); });
