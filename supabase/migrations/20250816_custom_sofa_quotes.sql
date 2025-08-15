create table if not exists public.custom_sofa_quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  customer_name text not null,
  customer_email text,
  customer_phone text,
  notes text,
  width_cm int not null,
  depth_cm int not null,
  height_cm int not null,
  seats int not null,
  skirt text not null check (skirt in ('none','short','long')),
  piping boolean not null default false,
  extra_cushions int not null default 0,
  quantity int not null default 1,
  fabric_id text not null,
  fabric_code text,
  fabric_name text not null,
  fabric_price_per_m numeric not null,
  meters_est numeric not null,
  price_fabric numeric not null,
  price_labor numeric not null,
  price_total_per_item numeric not null,
  price_total numeric not null,
  status text not null default 'new'
);

create index if not exists idx_custom_sofa_quotes_created on public.custom_sofa_quotes (created_at desc);
create index if not exists idx_custom_sofa_quotes_status on public.custom_sofa_quotes (status);
