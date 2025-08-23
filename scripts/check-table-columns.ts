#!/usr/bin/env tsx
// Check table columns for orders and customers using Supabase service role
// Usage: set NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY then: npx tsx scripts/check-table-columns.ts

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  console.log("Checking information_schema.columns for orders and customers...")
  try {
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("table_name,column_name,data_type,ordinal_position")
      .eq("table_schema", "public")
      .in("table_name", ["orders", "customers"])
      .order("table_name", { ascending: true })
      .order("ordinal_position", { ascending: true })

    if (error) {
      console.error("Query error:", error.message)
      process.exit(1)
    }

    if (!data || data.length === 0) {
      console.log("No columns found for orders/customers (tables may not exist).")
      process.exit(0)
    }

    console.log("Columns found:")
    let currentTable = ""
    for (const row of data) {
      const t = (row as any).table_name
      const c = (row as any).column_name
      const dt = (row as any).data_type
      if (t !== currentTable) {
        currentTable = t
        console.log(`\nTable: ${t}`)
      }
      console.log(`  - ${c} : ${dt}`)
    }
    process.exit(0)
  } catch (e: any) {
    console.error("Fatal error:", e.message || e)
    process.exit(1)
  }
}

main()
