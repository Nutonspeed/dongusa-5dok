import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
  const supabase = await createServerClient()

    // Test database connectivity and data flow
    const tests = [
      {
        name: "Categories",
        query: () => supabase.from("categories").select("id, name").limit(5),
      },
      {
        name: "Products",
        query: () => supabase.from("products").select("id, name, price").limit(5),
      },
      {
        name: "Orders",
        query: () => supabase.from("orders").select("id, status, total_amount").limit(5),
      },
      {
        name: "Profiles",
        query: () => supabase.from("profiles").select("id, email, role").limit(5),
      },
      {
        name: "Fabrics",
        query: () => supabase.from("fabrics").select("id, name, material").limit(5),
      },
    ]

    const results = await Promise.all(
      tests.map(async (test) => {
        try {
          const { data, error } = await test.query()
          return {
            table: test.name,
            status: error ? "FAIL" : "PASS",
            message: error ? error.message : `Retrieved ${data?.length || 0} records`,
            data: error ? null : data,
          }
        } catch (err) {
          return {
            table: test.name,
            status: "FAIL",
            message: `Unexpected error: ${err}`,
            data: null,
          }
        }
      }),
    )

    const summary = {
      total: results.length,
      passed: results.filter((r) => r.status === "PASS").length,
      failed: results.filter((r) => r.status === "FAIL").length,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      summary,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Data flow test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
