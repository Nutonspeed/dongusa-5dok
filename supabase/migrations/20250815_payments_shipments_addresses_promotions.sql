-- DO NOT remove or restructure UI; data wiring only
-- Payments, shipments, addresses, promotions schema

create table if not exists customers (
  id uuid primary key,
  email text unique,
  name text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists addresses (
  id uuid primary key,
  customer_id uuid references customers(id),
  line1 text,
  line2 text,
  district text,
  province text,
  postal_code text,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key,
  order_id uuid references orders(id),
  method text,
  amount numeric,
  currency text,
  status text,
  paid_at timestamptz,
  transaction_ref text
);

create table if not exists shipments (
  id uuid primary key,
  order_id uuid references orders(id),
  carrier text,
  tracking_no text,
  status text,
  shipped_at timestamptz
);

create table if not exists promotions (
  id uuid primary key,
  code text unique,
  discount_pct numeric check (discount_pct >= 0 and discount_pct <= 100),
  active boolean default true,
  starts_at timestamptz,
  ends_at timestamptz
);

create index if not exists idx_orders_customer_created_at on orders(customer_id, created_at);
create index if not exists idx_payments_order on payments(order_id);
create index if not exists idx_shipments_order on shipments(order_id);
create index if not exists idx_promotions_active on promotions(active, starts_at, ends_at);
