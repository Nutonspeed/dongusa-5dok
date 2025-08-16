-- Create guest users table for managing unregistered users
CREATE TABLE IF NOT EXISTS guest_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_to_user_id UUID REFERENCES profiles(id),
  conversion_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'converted', 'expired')),
  notes TEXT
);

-- Create guest orders table for orders placed by guest users
CREATE TABLE IF NOT EXISTS guest_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_user_id UUID REFERENCES guest_users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount NUMERIC(10,2) NOT NULL,
  items JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_order_id UUID REFERENCES orders(id)
);

-- Create guest cart items table
CREATE TABLE IF NOT EXISTS guest_cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_user_id UUID REFERENCES guest_users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  size TEXT,
  color TEXT,
  fabric_pattern TEXT,
  customizations TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guest_users_session_id ON guest_users(session_id);
CREATE INDEX IF NOT EXISTS idx_guest_users_email ON guest_users(email);
CREATE INDEX IF NOT EXISTS idx_guest_users_status ON guest_users(status);
CREATE INDEX IF NOT EXISTS idx_guest_users_last_activity ON guest_users(last_activity);
CREATE INDEX IF NOT EXISTS idx_guest_orders_guest_user_id ON guest_orders(guest_user_id);
CREATE INDEX IF NOT EXISTS idx_guest_orders_status ON guest_orders(status);
CREATE INDEX IF NOT EXISTS idx_guest_cart_items_guest_user_id ON guest_cart_items(guest_user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_guest_users_updated_at BEFORE UPDATE ON guest_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guest_orders_updated_at BEFORE UPDATE ON guest_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guest_cart_items_updated_at BEFORE UPDATE ON guest_cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired guest users (older than 30 days with no activity)
CREATE OR REPLACE FUNCTION cleanup_expired_guest_users()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE guest_users 
    SET status = 'expired' 
    WHERE status = 'active' 
    AND last_activity < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
