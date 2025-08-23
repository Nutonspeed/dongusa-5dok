import { createServerClient } from "@/lib/supabase"

async function testSupabaseConnection() {


  // Test environment variables




  // Test server client connection
  try {
  const supabase = await createServerClient()

    // Test a simple query to verify connection
  const { error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      // handle error if needed
    }
  } catch {
    // error intentionally ignored
  }

  // Verify expected environment variables from the provided config
  const expectedConfig = {
    SUPABASE_URL: "https://mcmasehidjxajhcrldhp.supabase.co",
    NEXT_PUBLIC_SUPABASE_URL: "https://mcmasehidjxajhcrldhp.supabase.co",
  }

  for (const [key, expectedValue] of Object.entries(expectedConfig)) {
    const actualValue = process.env[key]
    const matches = actualValue === expectedValue
    if (!matches) {
      // handle mismatch if needed
    }
  }
}

testSupabaseConnection()
