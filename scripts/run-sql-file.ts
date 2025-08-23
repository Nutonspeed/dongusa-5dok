#!/usr/bin/env tsx
// Run an SQL file against Supabase using the service_role key via RPC exec_sql
// Usage: npx tsx scripts/run-sql-file.ts [path/to/sql-file.sql]

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const sqlPath = process.argv[2] || "scripts/setup-database-tables.sql"
  const fullPath = join(process.cwd(), sqlPath)
  console.log("Running SQL file:", fullPath)

  const sqlContent = readFileSync(fullPath, "utf-8")
  const statements = sqlContent
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"))

  for (const [i, statement] of statements.entries()) {
    console.log(`\n--- Statement ${i + 1}/${statements.length} ---`)
    try {
      const { error } = await supabase.rpc("exec_sql", { sql: statement })
      if (error) {
        console.warn("Warning / Error:", error.message)
      } else {
        console.log("Executed OK")
      }
    } catch (err: any) {
      console.error("Execution failed:", err?.message ?? String(err))
    }
  }

  console.log("\nAll statements processed")
  process.exit(0)
}

run().catch((e) => {
  console.error("Fatal error:", e)
  process.exit(1)
})
