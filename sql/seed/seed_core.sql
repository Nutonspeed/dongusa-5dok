-- Use in Supabase SQL editor if TS seeder blocked by schema differences.
-- Adjust table/column names to match your schema before running.
-- Example skeleton (SAFE upserts):

-- Customers
insert into customers (id, name, phone, email, address, created_at, updated_at)
values
('cust_demo_alice','Alice Sofa','081-000-0001','alice@example.com','99/1 ...', now(), now()),
('cust_demo_bob','Bob Cover','081-000-0002','bob@example.com','101/7 ...', now(), now())
on conflict (id) do update set updated_at = excluded.updated_at;

-- Add similar upserts for orders, bills, bill_items, payments, shipments, activity_logs as needed.
