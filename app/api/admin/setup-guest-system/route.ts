import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: guestUsersError } = await supabase.from("guest_users").select("id").limit(1)

    if (guestUsersError && guestUsersError.code === "PGRST116") {
      // Table doesn't exist, create it
      const createTablesSQL = `
        -- Create guest_users table
        CREATE TABLE guest_users (
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
          notes TEXT
        );

        -- Create guest_orders table
        CREATE TABLE guest_orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          guest_user_id UUID NOT NULL REFERENCES guest_users(id) ON DELETE CASCADE,
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
          converted_order_id UUID
        );

        -- Create guest_cart_items table
        CREATE TABLE guest_cart_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          guest_user_id UUID NOT NULL REFERENCES guest_users(id) ON DELETE CASCADE,
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

        -- Create indexes
        CREATE INDEX idx_guest_users_session_id ON guest_users(session_id);
        CREATE INDEX idx_guest_users_email ON guest_users(email);
        CREATE INDEX idx_guest_users_status ON guest_users(status);
        CREATE INDEX idx_guest_orders_guest_user_id ON guest_orders(guest_user_id);
        CREATE INDEX idx_guest_cart_items_guest_user_id ON guest_cart_items(guest_user_id);

        -- Enable RLS
        ALTER TABLE guest_users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE guest_orders ENABLE ROW LEVEL SECURITY;
        ALTER TABLE guest_cart_items ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Allow public access to guest_users" ON guest_users FOR ALL USING (true);
        CREATE POLICY "Allow public access to guest_orders" ON guest_orders FOR ALL USING (true);
        CREATE POLICY "Allow public access to guest_cart_items" ON guest_cart_items FOR ALL USING (true);
      `

      // Execute the SQL using a direct query
      const { error: createError } = await supabase.rpc("exec_sql", {
        sql: createTablesSQL,
      })

      if (createError) {
        console.error("Error creating tables:", createError)
        return NextResponse.json(
          { error: "Failed to create guest user tables: " + createError.message },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "Guest User System tables created successfully!",
        status: "success",
      })
    } else if (!guestUsersError) {
      return NextResponse.json({
        message: "Guest User System is already set up!",
        status: "already_exists",
      })
    } else {
      return NextResponse.json({ error: "Database connection error: " + guestUsersError.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Internal server error occurred during setup" }, { status: 500 })
  }
}
