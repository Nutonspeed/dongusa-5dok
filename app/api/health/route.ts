import { NextResponse } from "next/server";
import { USE_SUPABASE, supabaseEnvInfo } from "@/lib/runtime";

export const runtime = "nodejs";

export async function GET() {
  const bypass = process.env.QA_BYPASS_AUTH === "1";
  const info = supabaseEnvInfo();
  return NextResponse.json({
    ok: true,
    bypass,
    mock: !USE_SUPABASE,
    useSupabase: USE_SUPABASE,
    env: {
      hasPublicUrl: info.hasPublicUrl,
      hasPublicAnon: info.hasPublicAnon,
      hasServerUrl: info.hasServerUrl,
      hasServerAnon: info.hasServerAnon,
      hasServiceRole: info.hasServiceRole,
      publicAnonLen: info.publicAnonLen,
      serverAnonLen: info.serverAnonLen,
    },
  });
}
