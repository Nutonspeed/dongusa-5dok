import { USE_SUPABASE, supabaseEnvInfo } from "@/lib/runtime"
import { createClient } from "@/lib/supabase/server"
import { featureFlags } from "@/utils/featureFlags"

export const runtime = "nodejs"

export async function GET() {
  const bypass = process.env.QA_BYPASS_AUTH === "1"
  const info = supabaseEnvInfo()
  const tables: string[] = []

  if (featureFlags.ENABLE_MOCK_SERVICES) {
    // Mock database tables are always available
    tables.push("products", "categories", "customers", "orders", "order_items")

    return Response.json({
      ok: true,
      bypass,
      mode: "mock",
      tables,
      mockServices: {
        database: "active",
        email: "active",
        upload: "active",
        payment: "active",
      },
      env: {
        mockMode: true,
        hasPublicUrl: false,
        hasPublicAnon: false,
        hasServerUrl: false,
        hasServerAnon: false,
        hasServiceRole: false,
        publicAnonLen: 0,
        serverAnonLen: 0,
      },
    })
  }

  if (USE_SUPABASE) {
    const supabase = await createClient()
    const checkTables = ["products", "categories", "customers", "orders", "order_items"]
    for (const t of checkTables) {
      const { error } = await supabase.from(t).select("id").limit(1)
      if (!error) tables.push(t)
    }
  }

  return Response.json({
    ok: true,
    bypass,
    mode: USE_SUPABASE ? "supabase" : "mock",
    tables,
    env: {
      hasPublicUrl: info.hasPublicUrl,
      hasPublicAnon: info.hasPublicAnon,
      hasServerUrl: info.hasServerUrl,
      hasServerAnon: info.hasServerAnon,
      hasServiceRole: info.hasServiceRole,
      publicAnonLen: info.publicAnonLen,
      serverAnonLen: info.serverAnonLen,
    },
  })
}
