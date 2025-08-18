import { createClient } from "@/lib/supabase/server"

async function testSupabaseConnection() {
  console.log("[v0] Testing Supabase connection...")

  // Test environment variables
  const envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "***SET***" : "NOT SET",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "***SET***" : "NOT SET",
  }

  console.log("[v0] Environment Variables Status:")
  console.table(envVars)

  // Test server client connection
  try {
    const supabase = createClient()
    console.log("[v0] Server client created successfully")

    // Test a simple query to verify connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.log("[v0] Connection test query failed:", error.message)
    } else {
      console.log("[v0] Connection test successful!")
    }
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
  }

  // Verify expected environment variables from the provided config
  const expectedConfig = {
    SUPABASE_URL: "https://mcmasehidjxajhcrldhp.supabase.co",
    NEXT_PUBLIC_SUPABASE_URL: "https://mcmasehidjxajhcrldhp.supabase.co",
  }

  console.log("[v0] Configuration Verification:")
  for (const [key, expectedValue] of Object.entries(expectedConfig)) {
    const actualValue = process.env[key]
    const matches = actualValue === expectedValue
    console.log(`${key}: ${matches ? "✅ MATCHES" : "❌ MISMATCH"}`)
    if (!matches) {
      console.log(`  Expected: ${expectedValue}`)
      console.log(`  Actual: ${actualValue || "NOT SET"}`)
    }
  }
}

testSupabaseConnection().catch(console.error)
