-- Updated SQL script to match the live database schema exactly
-- Create database tables based on the existing Supabase schema
-- This script ensures all necessary tables exist with proper structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fabric_collections table
CREATE TABLE IF NOT EXISTS fabric_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fabrics table
CREATE TABLE IF NOT EXISTS fabrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  collection_id UUID REFERENCES fabric_collections(id),
  material TEXT,
  color TEXT,
  pattern TEXT,
  image_url TEXT,
  price_per_meter NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  category_id UUID REFERENCES categories(id),
  stock_quantity INTEGER DEFAULT 0,
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table with ENUM types
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_fabrics_collection ON fabrics(collection_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Insert sample data if tables are empty
INSERT INTO categories (name, slug, description, is_active) 
SELECT 'ผ้าคลุมโซฟา', 'sofa-covers', 'ผ้าคลุมโซฟาคุณภาพสูง', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sofa-covers');

INSERT INTO fabric_collections (name, slug, description, is_featured, is_active)
SELECT 'คอลเลกชันคลาสสิก', 'classic-collection', 'ผ้าลายคลาสสิกที่เหมาะกับทุกบ้าน', true, true
WHERE NOT EXISTS (SELECT 1 FROM fabric_collections WHERE slug = 'classic-collection');

-- Insert sample fabrics
INSERT INTO fabrics (name, collection_id, material, color, pattern, price_per_meter, is_active)
SELECT 
  'ผ้าลายดอกไม้คลาสสิก',
  (SELECT id FROM fabric_collections WHERE slug = 'classic-collection'),
  'Cotton Blend',
  'สีครีม',
  'ลายดอกไม้',
  150.00,
  true
WHERE NOT EXISTS (SELECT 1 FROM fabrics WHERE name = 'ผ้าลายดอกไม้คลาสสิก');

-- Insert sample products
INSERT INTO products (name, slug, description, sku, price, category_id, stock_quantity, is_active)
SELECT 
  'ผ้าคลุมโซฟา 3 ที่นั่ง',
  'sofa-cover-3-seater',
  'ผ้าคลุมโซฟาสำหรับโซฟา 3 ที่นั่ง คุณภาพสูง',
  'SC-3SEAT-001',
  1500.00,
  (SELECT id FROM categories WHERE slug = 'sofa-covers'),
  50,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'sofa-cover-3-seater');
