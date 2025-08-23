-- Create customers table (from supabase/migrations/20250815_core_schema.sql)
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamptz DEFAULT now()
);
