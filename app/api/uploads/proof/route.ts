import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { supabase } from "@/lib/supabase/client"

// POST /api/uploads/proof
// form-data fields:
// - file: Blob
// - billId: string
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "invalid_content_type" }, { status: 400 })
    }

    const form = await request.formData()
    const file = form.get("file") as File | null
    const billId = (form.get("billId") as string | null)?.trim()

    if (!file || !billId) {
      return NextResponse.json({ error: "file_and_billId_required" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "bin"
    const filePath = `bills/${billId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage.from("payments").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    })

    if (error) {
      logger.error("supabase.storage.upload error", error)
      return NextResponse.json({ error: "upload_failed", details: error.message }, { status: 500 })
    }

    const { data: pub } = supabase.storage.from("payments").getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      path: data.path,
      publicUrl: pub.publicUrl,
    })
  } catch (e: any) {
    logger.error("proof upload error", e)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}
