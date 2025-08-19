import { NextResponse } from "next/server"
import { supabaseEnvInfo, USE_SUPABASE, QA_BYPASS_AUTH, NODE_ENV } from "@/lib/runtime"

export async function GET() {
  const info = supabaseEnvInfo()
  return NextResponse.json({
    ok: true,
    env: NODE_ENV,
    useSupabase: USE_SUPABASE,
    qaBypass: QA_BYPASS_AUTH,
    supabase: {
      hasPublicUrl: info.hasPublicUrl,
      hasPublicAnon: info.hasPublicAnon,
      hasServerUrl: info.hasServerUrl,
      hasServerAnon: info.hasServerAnon,
      publicAnonLen: info.publicAnonLen,
      serverAnonLen: info.serverAnonLen,
    },
  })
}
