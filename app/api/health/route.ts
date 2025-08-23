import { USE_SUPABASE, supabaseEnvInfo } from "@/lib/runtime"
import { createServerClient } from "@/lib/supabase"

export const runtime = "nodejs"

export async function GET() {
  const bypass = process.env.QA_BYPASS_AUTH === "1"
  const info = supabaseEnvInfo()
  const tables: string[] = []
  if (USE_SUPABASE) {
  const supabase = await createServerClient()
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
