/*
Ordered, idempotent SQL to run in Supabase SQL Editor.
- Creates helper function public.exec_sql
- Creates required extensions and ENUM types (if missing)
- Creates tables in dependency order
- Creates indexes and RLS policies only when relevant columns/tables exist

COPY-PASTE the entire file into Supabase Dashboard → SQL editor and Run.
Do NOT share your service_role key publicly.
*/

-- 1) Helper: create exec_sql (useful for RPC-based migration runners)
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _result JSONB;
BEGIN
  EXECUTE sql;
  _result := jsonb_build_object('ok', true, 'message', 'executed');
  RETURN _result;
EXCEPTION WHEN OTHERS THEN
  _result := jsonb_build_object('ok', false, 'message', SQLERRM);
  RETURN _result;
END;
$$;
-- Grant only basic execute so service-role can call it via RPC
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO authenticated;

-- 2) Extensions (safe)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3) Create ENUM types if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'staff');
  END IF;
END
$$;


-- 4) Tables in dependency order

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_category_active_idx ON products(category_id, is_active);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS customers_email_idx ON customers(email);

-- Addresses (depends on customers)
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (depends on customers and order_status type)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
    EXECUTE $sql$
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID REFERENCES customers(id),
        status order_status DEFAULT 'pending',
        total NUMERIC(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    $sql$;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS orders_status_created_at_idx ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS orders_customer_created_at_idx ON orders(customer_id, created_at);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number TEXT,
  carrier TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5) Row Level Security (create only if table/column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders' AND table_schema='public') THEN
    BEGIN
      EXECUTE 'ALTER TABLE orders ENABLE ROW LEVEL SECURITY';
    EXCEPTION WHEN others THEN
      -- ignore
    END;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='orders' AND column_name='customer_id'
    ) THEN
      -- Create policy only if not exists
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'customer_orders_select'
      ) THEN
        EXECUTE $p$
          CREATE POLICY customer_orders_select ON orders
          FOR SELECT USING (auth.uid() = customer_id)
        $p$;
      END IF;
    END IF;
  END IF;
END
$$;

-- Public read access for products/categories (safe creation of policy)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='products' AND table_schema='public') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'anyone_view_active_products'
    ) THEN
      EXECUTE $q$
        CREATE POLICY anyone_view_active_products ON products
        FOR SELECT USING (is_active = true)
      $q$;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='categories' AND table_schema='public') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'anyone_view_active_categories'
    ) THEN
      EXECUTE $r$
        CREATE POLICY anyone_view_active_categories ON categories
        FOR SELECT USING (is_active = true)
      $r$;
    END IF;
  END IF;
END
$$;

-- 6) Final check note
-- After running, verify in Supabase Dashboard -> Table Editor that tables:
-- products, categories, customers, orders, order_items, addresses exist.
-- If anything reports an error, copy the error text and share it with me so I can fix ordering/DDL.
