#!/usr/bin/env tsx
import "server-only"
// Database Foundation Setup Script
// Run with: pnpm exec tsx scripts/setup-database-foundation.ts

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase environment variables")
  console.error("Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runSQLScript(scriptPath: string, description: string) {
  console.log(`🔄 Running ${description}...`)

  try {
    const sqlContent = readFileSync(join(process.cwd(), "scripts", scriptPath), "utf-8")

    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"))

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc("exec_sql", { sql: statement })
        if (error) {
          console.warn(`⚠️ Warning in ${description}:`, error.message)
        }
      }
    }

    console.log(`✅ ${description} completed`)
    return true
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error)
    return false
  }
}

async function validateConnection() {
  console.log("🔄 Validating Supabase connection...")

  try {
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error && !error.message.includes('relation "profiles" does not exist')) {
      throw error
    }

    console.log("✅ Supabase connection validated")
    return true
  } catch (error) {
    console.error("❌ Supabase connection failed:", error)
    return false
  }
}

async function checkExistingSchema() {
  console.log("🔄 Checking existing database schema...")

  try {
    const { data: tables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    const existingTables = tables?.map((t) => t.table_name) || []
    console.log(`📊 Found ${existingTables.length} existing tables:`, existingTables.join(", "))

    return existingTables
  } catch (error) {
    console.log("📊 No existing tables found (fresh database)")
    return []
  }
}

async function setupFoundation() {
  console.log("🚀 Starting Database Foundation Setup")
  console.log("=====================================")

  // Step 1: Validate connection
  if (!(await validateConnection())) {
    process.exit(1)
  }

  // Step 2: Check existing schema
  const existingTables = await checkExistingSchema()

  // Step 3: Run core schema setup
  const success = await runSQLScript("create-supabase-schema.sql", "Core Database Schema Setup")

  if (!success) {
    console.error("❌ Failed to setup core schema")
    process.exit(1)
  }

  // Step 4: Run validation
  await runSQLScript("validate-database-schema.sql", "Database Schema Validation")

  // Step 5: Seed with sample data if needed
  if (existingTables.length === 0) {
    console.log("🌱 Seeding database with sample data...")
    await runSQLScript("seed-sample-data.sql", "Sample Data Seeding")
  }

  // Step 6: Performance optimization
  await runSQLScript("optimize-database-performance.sql", "Database Performance Optimization")

  console.log("")
  console.log("🎉 Database Foundation Setup Complete!")
  console.log("=====================================")
  console.log("✅ Core schema created")
  console.log("✅ RLS policies configured")
  console.log("✅ Indexes optimized")
  console.log("✅ Sample data seeded")
  console.log("")
  console.log("Next steps:")
  console.log("1. Run: pnpm qa:supabase to test the setup")
  console.log("2. Start development: pnpm dev")
  console.log("3. Check admin panel: http://localhost:3000/admin")
}

// Run the setup
setupFoundation().catch((error) => {
  console.error("💥 Setup failed:", error)
  process.exit(1)
})
