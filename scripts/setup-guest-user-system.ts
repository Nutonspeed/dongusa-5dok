import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupGuestUserSystem() {
  console.log("🚀 Setting up Guest User System...")

  try {
    // Check if tables already exist
    const { data: existingTables, error: checkError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["guest_users", "guest_orders", "guest_cart_items"])

    if (checkError) {
      console.error("❌ Error checking existing tables:", checkError)
      return
    }

    const existingTableNames = existingTables?.map((t) => t.table_name) || []

    if (existingTableNames.length > 0) {
      console.log("⚠️  Some guest user tables already exist:", existingTableNames)
      console.log("✅ Guest User System is already set up!")
      return
    }

    // Create guest_users table
    const { error: guestUsersError } = await supabase.rpc("exec_sql", {
      sql: `
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
          notes TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_guest_users_session_id ON guest_users(session_id);
        CREATE INDEX IF NOT EXISTS idx_guest_users_email ON guest_users(email);
        CREATE INDEX IF NOT EXISTS idx_guest_users_status ON guest_users(status);
        
        ALTER TABLE guest_users ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public access to guest_users" ON guest_users FOR ALL USING (true);
      `,
    })

    if (guestUsersError) {
      console.error("❌ Error creating guest_users table:", guestUsersError)
      return
    }

    console.log("✅ Guest users table created successfully")

    // Create guest_orders table
    const { error: guestOrdersError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS guest_orders (
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
        
        CREATE INDEX IF NOT EXISTS idx_guest_orders_guest_user_id ON guest_orders(guest_user_id);
        CREATE INDEX IF NOT EXISTS idx_guest_orders_status ON guest_orders(status);
        
        ALTER TABLE guest_orders ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public access to guest_orders" ON guest_orders FOR ALL USING (true);
      `,
    })

    if (guestOrdersError) {
      console.error("❌ Error creating guest_orders table:", guestOrdersError)
      return
    }

    console.log("✅ Guest orders table created successfully")

    // Create guest_cart_items table
    const { error: guestCartError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS guest_cart_items (
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
        
        CREATE INDEX IF NOT EXISTS idx_guest_cart_items_guest_user_id ON guest_cart_items(guest_user_id);
        
        ALTER TABLE guest_cart_items ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public access to guest_cart_items" ON guest_cart_items FOR ALL USING (true);
      `,
    })

    if (guestCartError) {
      console.error("❌ Error creating guest_cart_items table:", guestCartError)
      return
    }

    console.log("✅ Guest cart items table created successfully")
    console.log("🎉 Guest User System setup completed successfully!")
  } catch (error) {
    console.error("❌ Unexpected error during setup:", error)
  }
}

// Run the setup
setupGuestUserSystem()
