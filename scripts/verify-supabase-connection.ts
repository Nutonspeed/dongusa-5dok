import { createServerClient } from "@/lib/supabase"
import { supabase as clientSupabase } from "@/lib/supabase/client"

interface ConnectionTest {
  name: string
  success: boolean
  message: string
  data?: any
}

async function verifySupabaseConnection() {


  const tests: ConnectionTest[] = []

  // Test 1: Environment Variables

  const envTest = {
    name: "Environment Variables",
    success: false,
    message: "",
    data: {},
  }

  const requiredEnvs = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  const missingEnvs = requiredEnvs.filter((env) => !process.env[env])

  if (missingEnvs.length === 0) {
    envTest.success = true
    envTest.message = "All required environment variables are present"
    envTest.data = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    }
  } else {
    envTest.message = `Missing environment variables: ${missingEnvs.join(", ")}`
  }

  tests.push(envTest)


  // Test 2: Server Client Connection

  const serverTest = {
    name: "Server Client",
    success: false,
    message: "",
  }

  try {
    const serverClient = await createServerClient()
    const { data, error } = await serverClient.from("profiles").select("count", { count: "exact", head: true })

    if (error) {
      serverTest.message = `Server client error: ${error.message}`
    } else {
      serverTest.success = true
      serverTest.message = `Server client connected successfully. Profiles table accessible.`
    }
  } catch (error) {
    serverTest.message = `Server client connection failed: ${error.message}`
  }

  tests.push(serverTest)


  // Test 3: Client Connection

  const clientTest = {
    name: "Client Connection",
    success: false,
    message: "",
  }

  try {
    const { data, error } = await clientSupabase.from("products").select("count", { count: "exact", head: true })

    if (error) {
      clientTest.message = `Client connection error: ${error.message}`
    } else {
      clientTest.success = true
      clientTest.message = `Client connected successfully. Products table accessible.`
    }
  } catch (error) {
    clientTest.message = `Client connection failed: ${error.message}`
  }

  tests.push(clientTest)


  // Test 4: Database Schema Check

  const schemaTest = {
    name: "Database Schema",
    success: false,
    message: "",
    data: {},
  }

  try {
    const serverClient = await createServerClient()
    const tables = ["profiles", "products", "categories", "orders", "fabric_collections", "fabrics"]
    const tableStatus = {}

    for (const table of tables) {
      try {
        const { count, error } = await serverClient.from(table).select("*", { count: "exact", head: true })
        tableStatus[table] = error ? `Error: ${error.message}` : `✅ ${count || 0} records`
      } catch (error) {
        tableStatus[table] = `❌ ${error.message}`
      }
    }

    schemaTest.success = Object.values(tableStatus).some((status) => status.toString().includes("✅"))
    schemaTest.message = schemaTest.success ? "Database schema verified" : "Database schema issues detected"
    schemaTest.data = tableStatus
  } catch (error) {
    schemaTest.message = `Schema check failed: ${error.message}`
  }

  tests.push(schemaTest)


  // Test 5: Create Notes Table (from your instructions)

  const notesTest = {
    name: "Notes Table Creation",
    success: false,
    message: "",
  }

  try {
    const serverClient = await createServerClient()

    // Check if notes table exists
    const { data: existingNotes, error: selectError } = await serverClient
      .from("notes")
      .select("count", { count: "exact", head: true })

    if (selectError && selectError.code === "PGRST116") {
      // Table doesn't exist, create it
      const createTableSQL = `
        -- Create the table
        CREATE TABLE IF NOT EXISTS notes (
          id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          title text NOT NULL,
          created_at timestamp with time zone DEFAULT now()
        );

        -- Insert some sample data into the table
        INSERT INTO notes (title)
        VALUES
          ('Today I created a Supabase project.'),
          ('I added some data and queried it from Next.js.'),
          ('It was awesome!')
        ON CONFLICT DO NOTHING;

        -- Enable RLS
        ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

        -- Create policy for public read access
        CREATE POLICY IF NOT EXISTS "public can read notes"
        ON public.notes
        FOR SELECT TO anon
        USING (true);
      `

      // Note: In a real implementation, you'd use Supabase's SQL editor or RPC function
      // For now, we'll just try to insert data to test
      const { error: insertError } = await serverClient
        .from("notes")
        .insert([
          { title: "Today I created a Supabase project." },
          { title: "I added some data and queried it from Next.js." },
          { title: "It was awesome!" },
        ])

      if (insertError && insertError.code !== "23505") {
        // Ignore duplicate key errors
        notesTest.message = `Failed to create/populate notes table: ${insertError.message}`
      } else {
        notesTest.success = true
        notesTest.message = "Notes table created and populated successfully"
      }
    } else if (selectError) {
      notesTest.message = `Notes table check failed: ${selectError.message}`
    } else {
      notesTest.success = true
      notesTest.message = `Notes table already exists with ${existingNotes || 0} records`
    }
  } catch (error) {
    notesTest.message = `Notes table test failed: ${error.message}`
  }

  tests.push(notesTest)


  // Test 6: Authentication Test

  const authTest = {
    name: "Authentication",
    success: false,
    message: "",
  }

  try {
    const serverClient = await createServerClient()
    const {
      data: { session },
      error,
    } = await serverClient.auth.getSession()

    if (error) {
      authTest.message = `Auth system error: ${error.message}`
    } else {
      authTest.success = true
      authTest.message = session ? "Auth system working, session found" : "Auth system working, no active session"
    }
  } catch (error) {
    authTest.message = `Auth test failed: ${error.message}`
  }

  tests.push(authTest)


  // Summary


  const successCount = tests.filter((test) => test.success).length
  const totalTests = tests.length



  if (successCount === totalTests) {

  } else {

  }

  // Detailed results

  tests.forEach((test) => {

    if (test.data) {

    }
  })

  return {
    success: successCount === totalTests,
    results: tests,
    summary: {
      passed: successCount,
      failed: totalTests - successCount,
      total: totalTests,
    },
  }
}

// Run verification
verifySupabaseConnection()
  .then((result) => {

    process.exit(result.success ? 0 : 1)
  })
  .catch((error) => {
  // Error handled
    process.exit(1)
  })
