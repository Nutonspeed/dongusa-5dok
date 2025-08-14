import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test storage service configuration
    const storageConfig = {
      vercelBlob: process.env.BLOB_READ_WRITE_TOKEN ? "configured" : "missing",
      supabaseStorage: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("Storage service not configured")
    }

    return NextResponse.json({
      status: "ok",
      config: storageConfig,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Storage service check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
