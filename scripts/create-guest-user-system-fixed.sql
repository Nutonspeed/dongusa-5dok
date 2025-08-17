-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create guest users table for managing unregistered users
CREATE TABLE IF NOT EXISTS guest_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_to_user_id UUID,
  conversion_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  CONSTRAINT guest_users_status_check CHECK (status IN ('active', 'converted', 'expired')),
  CONSTRAINT fk_converted_user FOREIGN KEY (converted_to_user_id) REFERENCES profiles(id)
);

-- Create guest orders table for orders placed by guest users
CREATE TABLE IF NOT EXISTS guest_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_user_id UUID NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL,
  items JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_order_id UUID,
  CONSTRAINT guest_orders_status_check CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  CONSTRAINT guest_orders_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  CONSTRAINT fk_guest_user FOREIGN KEY (guest_user_id) REFERENCES guest_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_converted_order FOREIGN KEY (converted_order_id) REFERENCES orders(id)
);

-- Create guest cart items table
CREATE TABLE IF NOT EXISTS guest_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_user_id UUID NOT NULL,
  product_id UUID,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  size TEXT,
  color TEXT,
  fabric_pattern TEXT,
  customizations TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_guest_cart_user FOREIGN KEY (guest_user_id) REFERENCES guest_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_guest_cart_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guest_users_session_id ON guest_users(session_id);
CREATE INDEX IF NOT EXISTS idx_guest_users_email ON guest_users(email);
CREATE INDEX IF NOT EXISTS idx_guest_users_status ON guest_users(status);
CREATE INDEX IF NOT EXISTS idx_guest_users_last_activity ON guest_users(last_activity);
CREATE INDEX IF NOT EXISTS idx_guest_orders_guest_user_id ON guest_orders(guest_user_id);
CREATE INDEX IF NOT EXISTS idx_guest_orders_status ON guest_orders(status);
CREATE INDEX IF NOT EXISTS idx_guest_cart_items_guest_user_id ON guest_cart_items(guest_user_id);

-- Enable Row Level Security
ALTER TABLE guest_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for guest_users
CREATE POLICY "Allow public read access to guest_users" ON guest_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert to guest_users" ON guest_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to guest_users" ON guest_users FOR UPDATE USING (true);

-- Create RLS policies for guest_orders
CREATE POLICY "Allow public read access to guest_orders" ON guest_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert to guest_orders" ON guest_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to guest_orders" ON guest_orders FOR UPDATE USING (true);

-- Create RLS policies for guest_cart_items
CREATE POLICY "Allow public read access to guest_cart_items" ON guest_cart_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert to guest_cart_items" ON guest_cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to guest_cart_items" ON guest_cart_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to guest_cart_items" ON guest_cart_items FOR DELETE USING (true);
